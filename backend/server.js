const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 3101;  // 포트를 3101로 설정

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// CORS 미들웨어 추가
app.use(cors());

app.use(express.json());

// 무제한 IP 목록 정의
const unlimitedIPs = ['127.0.0.1', '::1', '124.49.147.145']; // 새 IP 주소 추가 // localhost IP 추가

// IP 주소 확인 함수
function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  let ip = req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           req.connection.socket.remoteAddress;
  
  // IPv4-mapped IPv6 주소 처리
  if (ip.substr(0, 7) === "::ffff:") {
    ip = ip.substr(7);
  }
  return ip;
}

// Rate limiter 설정
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 시간
  max: (req) => {
    const clientIp = getClientIp(req);
    return unlimitedIPs.some(ip => clientIp.includes(ip)) ? 1000000 : 10; // 무제한 IP는 높은 제한, 그 외는 10회
  },
  message: '일일 요청 한도를 초과했습니다. 내일 다시 시도해 주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 모든 요청에 rate limiter 적용
app.use(limiter);



// Multer 설정 (메모리 스토리지 사용)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 10 }
});

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file.buffer, file.originalname);

  try {
    const response = await axios.post('http://192.168.0.119:8188/upload/image', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    console.log(`이미지 ${file.originalname} 업로드 완료`);
    return response.data;
  } catch (error) {
    console.error(`이미지 ${file.originalname} 업로드 중 오류:`, error);
    throw error;
  }
}

async function waitForImageUpload(filename) {
  const maxAttempts = 10;
  const delayMs = 2000; // 2초 대기

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.get(`http://192.168.0.119:8188/view`, {
        params: {
          filename: filename,
          type: 'input'
        },
        responseType: 'arraybuffer'  // 이미지 데이터를 받기 위해 설정
      });

      if (response.status === 200 && response.data.byteLength > 0) {
        console.log(`이미지 ${filename} 업로드 확인 완료`);
        return true;
      }
    } catch (error) {
      console.log(`이미지 ${filename} 업로드 확인 중... (시도 ${attempt + 1}/${maxAttempts})`);
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  console.warn(`이미지 ${filename} 업로드 확인 실패. 프로세스를 계속 진행합니다.`);
  return false;
}

async function sendPrompt(workflow) {
  try {
    const response = await axios.post('http://192.168.0.119:8188/prompt', { prompt: workflow });
    return response.data;
  } catch (error) {
    console.error('프롬프트 전송 중 오류:', error);
    throw error;
  }
}

async function waitForImage(promptId) {
  const maxAttempts = 60; // 최대 60번 시도 (총 2분)
  const delayMs = 2000; // 2초 간격으로 확인

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.get(`http://192.168.0.119:8188/history/${promptId}`);
      const history = response.data;
      
      console.log(`Attempt ${attempt + 1}: Received history:`, JSON.stringify(history, null, 2));

      if (promptId in history) {
        console.log(`Found promptId ${promptId} in history`);
        const promptData = history[promptId];
        
        if (promptData.status && promptData.status.status_str === 'success') {
          console.log('Status is success');
          const outputs = promptData.outputs;
          console.log('Outputs:', JSON.stringify(outputs, null, 2));
          
          if (outputs && outputs["85"] && outputs["85"].images && outputs["85"].images.length > 0) {
            const filename = outputs["85"].images[0].filename;
            console.log(`이미지 생성 완료: ${filename}`);
            return filename;
          } else {
            console.log('No image found in node 85');
            // 다른 노드에서 이미지 찾기
            for (const nodeId in outputs) {
              if (outputs[nodeId].images && outputs[nodeId].images.length > 0) {
                const filename = outputs[nodeId].images[0].filename;
                console.log(`이미지 생성 완료: ${filename} (노드 ${nodeId})`);
                return filename;
              }
            }
          }
        } else if (promptData.status && promptData.status.status_str === 'error') {
          console.log('Status is error');
          throw new Error(`Workflow execution failed: ${promptData.status.error}`);
        } else {
          console.log(`Status is ${promptData.status ? promptData.status.status_str : 'unknown'}, waiting...`);
        }
      } else {
        console.log(`promptId ${promptId} not found in history`);
      }
      
      console.log(`이미지 생성 대기 중... (시도 ${attempt + 1}/${maxAttempts})`);
    } catch (error) {
      console.error('이미지 대기 중 오류:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  throw new Error('이미지 생성 타임아웃');
}

async function downloadAndRenameImage(url, originalName) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const newFileName = `processed_${originalName}`;
    const filePath = path.join(tempDir, newFileName);
    await fsPromises.writeFile(filePath, buffer);
    console.log(`이미지 저장 완료: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('이미지 다운로드 및 저장 중 오류:', error);
    throw error;
  }
}

async function createZipArchive(files, outputPath) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    const output = fs.createWriteStream(outputPath);

    output.on('close', () => {
      console.log('ZIP 파일 생성 완료');
      resolve();
    });

    archive.on('error', (err) => {
      console.error('ZIP 파일 생성 중 오류:', err);
      reject(err);
    });

    archive.pipe(output);

    files.forEach(file => {
      if (file && file.processedPath && fs.existsSync(file.processedPath)) {
        archive.file(file.processedPath, { name: file.originalName });
      } else {
        console.warn(`유효하지 않은 파일 또는 경로: ${file ? file.originalName : 'unknown'}`);
      }
    });

    archive.finalize();
  });
}

async function processImage(file, promptData) {
  try {
    // 이미지 업로드
    const uploadResponse = await uploadImage(file);
    const uploadedFileName = uploadResponse.name; // 업로드된 파일의 이름

    // 이미지 업로드 완료 확인
    await waitForImageUpload(uploadedFileName);

    // backgroundtest.json 읽기
    const jsonPath = path.join(__dirname, 'backgroundtest.json');
    const jsonContent = await fsPromises.readFile(jsonPath, 'utf8');
    let workflow = JSON.parse(jsonContent);

    // workflow 수정
    if (workflow["9"] && workflow["9"].inputs) {
      workflow["9"].inputs.image = uploadedFileName;
    }

    // 프롬프트 전송
    const promptResponse = await sendPrompt(workflow);
    console.log(`이미지 ${uploadedFileName}에 대한 프롬프트 응답:`, promptResponse);

    // 이미지 생성 대기
    const imageFilename = await waitForImage(promptResponse.prompt_id);

    const imageUrl = `http://192.168.0.119:8188/view?filename=${imageFilename}`;
    const downloadedImagePath = await downloadAndRenameImage(imageUrl, file.originalname);

    return {
      originalName: file.originalname,
      processedPath: downloadedImagePath
    };
  } catch (error) {
    console.error(`이미지 ${file.originalname} 처리 중 오:`, error);
    throw error;
  }
}

async function logAccess(req) {
  const timestamp = new Date().toISOString();
  const ip = req.ip;
  const logEntry = `${timestamp},${ip}\n`;
  
  const logPath = path.join(__dirname, 'access.log');
  await fsPromises.appendFile(logPath, logEntry);
}

// Express 미들웨어로 사용
app.use(async (req, res, next) => {
  await logAccess(req);
  next();
});

app.post('/uploads', upload.array('photos', 10), async (req, res) => {
  try {
    console.log('업로드된 파일들:');
    req.files.forEach((file, index) => {
      console.log(`파일 ${index + 1}:`, file.originalname);
    });

    const promptData = JSON.parse(req.body.prompt || '{}');
    const processedImages = [];
    for (const file of req.files) {
      try {
        const result = await processImage(file, promptData);
        if (result && result.processedPath) {
          processedImages.push(result);
        }
      } catch (error) {
        console.error(`파일 처리 중 오류 발생: ${file.originalname}`, error);
      }
    }

    if (processedImages.length === 0) {
      return res.status(400).send('처리된 이미지가 없습니다.');
    }

    // ZIP 파일 생성
    const zipFilePath = path.join(__dirname, 'temp', `processed_images_${Date.now()}.zip`);
    await createZipArchive(processedImages, zipFilePath);

    // ZIP 파일 전송
    res.download(zipFilePath, 'processed_images.zip', async (err) => {
      if (err) {
        console.error('ZIP 파일 다운로드 중 오류:', err);
        if (!res.headersSent) {
          res.status(500).send('ZIP 파일 다운로드 중 오류가 발생했습니다.');
        }
      }
      // 임시 파일들 삭제
      for (const img of processedImages) {
        if (img.processedPath) {
          await fsPromises.unlink(img.processedPath).catch(console.error);
        }
      }
      await fsPromises.unlink(zipFilePath).catch(console.error);
    });
  } catch (error) {
    console.error('오류 발생:', error);
    if (!res.headersSent) {
      res.status(500).send('파일 처리 중 오류가 발생했습니다.');
    }
  }
});

app.get('/stats', async (req, res) => {
  const logPath = path.join(__dirname, 'access.log');
  try {
    const logContent = await fsPromises.readFile(logPath, 'utf-8');
    const lines = logContent.split('\n').filter(line => line.trim() !== '');
    
    const stats = {
      totalAccesses: lines.length,
      accessesByHour: {},
      accessesByDay: {},
      accessesByMonth: {},
      uniqueIPs: new Set(),
      mostActiveHour: '',
      averageDailyAccesses: 0,
      ipAccessCounts: {}
    };
    
    const now = new Date();
    let totalDays = 0;
    
    lines.forEach(line => {
    
      const [timestamp, ip] = line.split(',');
      const date = new Date(timestamp);
      const hour = date.getHours();
      const day = date.toISOString().split('T')[0];
      const month = date.toISOString().slice(0, 7);

      stats.accessesByHour[hour] = (stats.accessesByHour[hour] || 0) + 1;
      stats.accessesByDay[day] = (stats.accessesByDay[day] || 0) + 1;
      stats.accessesByMonth[month] = (stats.accessesByMonth[month] || 0) + 1;
      stats.uniqueIPs.add(ip);

      if (date > now - 30 * 24 * 60 * 60 * 1000) {
        totalDays++;
      }

      // IP별 접속 횟수 카운트
      stats.ipAccessCounts[ip] = (stats.ipAccessCounts[ip] || 0) + 1;
    });
    
    stats.uniqueVisitors = stats.uniqueIPs.size;
    stats.mostActiveHour = Object.entries(stats.accessesByHour).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    stats.averageDailyAccesses = totalDays > 0 ? Math.round(lines.length / totalDays) : 0;
    
    // 가장 많이 접속한 IP 찾기
    const mostActiveIP = Object.entries(stats.ipAccessCounts).reduce((a, b) => a[1] > b[1] ? a : b);
    stats.mostActiveIP = {
      ip: mostActiveIP[0],
      count: mostActiveIP[1]
    };

    // IP 접속 횟수 정보 정렬 (상위 10개만 유지)
    stats.topIPs = Object.entries(stats.ipAccessCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    delete stats.ipAccessCounts;
    delete stats.uniqueIPs;
    
    res.json(stats);
  } catch (error) {
    console.error('로그 파일 읽기 오류:', error);
    res.status(500).send('통계 데이터를 가져오는 중 오류가 발생했습니다.');
  }
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

app.set('trust proxy', 1);

app.use(express.static('public'));  // 'public'은 정적 파일이 있는 폴더 이름입니다.

app.get('/unlimited-ips', (req, res) => {
  res.json(unlimitedIPs);
});

app.post('/unlimited-ips', (req, res) => {
  const { ip } = req.body;
  if (ip && !unlimitedIPs.some(existingIp => ip.includes(existingIp))) {
    unlimitedIPs.push(ip);
    console.log('Updated unlimitedIPs:', unlimitedIPs);
  }
  res.sendStatus(200);
});

app.delete('/unlimited-ips', (req, res) => {
  const { ip } = req.body;
  const index = unlimitedIPs.findIndex(existingIp => ip.includes(existingIp));
  if (index > -1) {
    unlimitedIPs.splice(index, 1);
    console.log('Updated unlimitedIPs:', unlimitedIPs);
  }
  res.sendStatus(200);
});