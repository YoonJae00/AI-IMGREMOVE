require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { EventEmitter } = require('events');
const ComfyUIService = require('./services/comfyui');

// 설정
const config = {
  comfyui: {
    baseUrl: process.env.COMFYUI_URL || 'http://localhost:8188',
    workflowsPath: path.join(__dirname, 'workflows')
  }
};

// 상수 정의
const LIMITATIONS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  removeBackground: {
    maxFiles: 50,
    processingTimePerImage: 5
  },
  studio: {
    maxFiles: 1,
    processingTime: 30
  },
  dailyRequestLimit: 10
};

const ERROR_CODES = {
  INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다',
  FILE_TOO_LARGE: '파일 크기가 제한을 초과했습니다',
  TOO_MANY_FILES: '최대 파일 개수를 초과했습니다',
  DAILY_LIMIT_EXCEEDED: '일일 처리 한도를 초과했습니다',
  PROCESSING_ERROR: '이미지 처리 중 오류가 발생했습니다',
  SERVER_ERROR: '서버 오류가 발생했습니다'
};

class ImageProcessor extends EventEmitter {
  constructor(comfyuiService) {
    super();
    this.processingImages = new Map();
    this.comfyui = comfyuiService;
  }

  updateProgress(imageId, progress, status) {
    this.emit('progress', { imageId, progress, status });
    this.processingImages.set(imageId, { progress, status });
  }

  async processImage(file, options = {}) {
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      this.updateProgress(imageId, 0, 'pending');
      
      // 파일 검증
      if (!LIMITATIONS.supportedFormats.includes(file.mimetype)) {
        throw new Error(ERROR_CODES.INVALID_FILE_TYPE);
      }
      if (file.size > LIMITATIONS.maxFileSize) {
        throw new Error(ERROR_CODES.FILE_TOO_LARGE);
      }
  
      // 메인 이미지 업로드
      this.updateProgress(imageId, 20, 'processing');
      const mainImageResponse = await this.comfyui.uploadImage(file);
      await this.comfyui.waitForImageUpload(mainImageResponse.name);
      
      this.updateProgress(imageId, 40, 'processing');
  
      // 워크플로우 가져오기
      let workflow = await this.comfyui.getWorkflow('bgrm_api');
      
      // 로깅
      console.log('Original workflow:', JSON.stringify(workflow, null, 2));
      // 메인 이미지를 노드 11에 설정
      workflow["11"].inputs.image = mainImageResponse.name;
      
      if (!options.backgroundImage) {
        // 배경 이미지가 없는 경우, 노드 66, 69, 70 제거
        delete workflow["66"];
        delete workflow["69"];
        delete workflow["70"];
        
        // 노드 65(LayerBlend) 제거
        delete workflow["65"];
        
        // PreviewImage 노드(68)를 배경제거 결과(노드 12)에 직접 연결
        workflow["68"].inputs.images = ["12", 0];
      } else {
        // 배경 이미지 설정
        const bgImageResponse = await this.comfyui.uploadImage(options.backgroundImage);
        await this.comfyui.waitForImageUpload(bgImageResponse.name);
        workflow["66"].inputs.image = bgImageResponse.name;
      }
      
      // 수정된 워크플로우 로그
      console.log('Modified workflow:', JSON.stringify(workflow, null, 2));
      
      this.updateProgress(imageId, 60, 'processing');
      
      // 프롬프트 전송
      const promptResponse = await this.comfyui.sendPrompt(workflow);
      
      this.updateProgress(imageId, 80, 'processing');
      
      // 결과 이미지 대기
      const imageFilename = await this.comfyui.waitForImage(promptResponse.prompt_id);
      const processedUrl = `${this.comfyui.baseUrl}/view?filename=${imageFilename}&type=temp`;
      
      this.updateProgress(imageId, 100, 'completed');
  
      return {
        id: imageId,
        originalName: file.originalname,
        url: processedUrl,
        status: 'completed'
      };
  
    } catch (error) {
      console.error('Image processing error:', error);
      this.updateProgress(imageId, 100, 'failed');
      throw error;
    }
  }
}

// Express 앱 초기화
const app = express();
const comfyuiService = new ComfyUIService(config);
const imageProcessor = new ImageProcessor(comfyuiService);
const progressClients = new Map();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: LIMITATIONS.dailyRequestLimit,
  message: { 
    success: false, 
    error: { 
      code: 'DAILY_LIMIT_EXCEEDED',
      message: ERROR_CODES.DAILY_LIMIT_EXCEEDED 
    }
  }
}));

// 파일 업로드 설정
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: LIMITATIONS.maxFileSize,
    files: LIMITATIONS.removeBackground.maxFiles
  },
  fileFilter: (req, file, cb) => {
    if (LIMITATIONS.supportedFormats.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(ERROR_CODES.INVALID_FILE_TYPE));
    }
  }
});

// 배경제거 API
app.post('/api/remove-background', upload.fields([
  { name: 'photos', maxCount: LIMITATIONS.removeBackground.maxFiles },
  { name: 'background', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files['photos']) {
      throw new Error('이미지 파일이 필요합니다.');
    }

    const processedImages = [];
    const backgroundImage = req.files['background']?.[0];

    for (const file of req.files['photos']) {
      try {
        const result = await imageProcessor.processImage(file, { 
          backgroundImage: backgroundImage 
        });
        processedImages.push(result);
      } catch (error) {
        processedImages.push({
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          originalName: file.originalname,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        processedImages,
        totalProcessed: processedImages.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'PROCESSING_ERROR',
        message: error.message || ERROR_CODES.PROCESSING_ERROR
      }
    });
  }
});


// 스튜디오 API
app.post('/api/studio-process', upload.single('photo'), async (req, res) => {
  try {
    const startTime = Date.now();
    const result = await imageProcessor.processImage(req.file);
    const processingTime = (Date.now() - startTime) / 1000;

    res.json({
      success: true,
      data: {
        ...result,
        processingTime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'PROCESSING_ERROR',
        message: error.message || ERROR_CODES.PROCESSING_ERROR
      }
    });
  }
});

// 진행상태 모니터링 API
app.get('/api/remove-background/progress', (req, res) => {
  const clientId = Date.now().toString();
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendProgress = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  progressClients.set(clientId, sendProgress);
  imageProcessor.on('progress', sendProgress);

  req.on('close', () => {
    progressClients.delete(clientId);
    imageProcessor.removeListener('progress', sendProgress);
  });
});

// 에러 처리 미들웨어
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    success: false,
    error: {
      code: error.code || 'SERVER_ERROR',
      message: error.message || ERROR_CODES.SERVER_ERROR
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});