const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;
const path = require('path');

class ComfyUIService {
  constructor(config) {
    this.baseUrl = config.comfyui.baseUrl || 'http://localhost:8188';
    this.workflowsPath = config.comfyui.workflowsPath || path.join(__dirname, '../workflows');
  }

  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file.buffer, file.originalname);

      const response = await axios.post(`${this.baseUrl}/upload/image`, formData, {
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

  async waitForImageUpload(filename) {
    const maxAttempts = 10;
    const delayMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(`${this.baseUrl}/view`, {
          params: {
            filename: filename,
            type: 'input'
          },
          responseType: 'arraybuffer'
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
    throw new Error('이미지 업로드 확인 실패');
  }

  async getWorkflow(type = 'transparent') {
    const workflowPath = path.join(this.workflowsPath, `${type}.json`);
    const jsonContent = await fs.readFile(workflowPath, 'utf8');
    return JSON.parse(jsonContent);
  }

  async sendPrompt(workflow) {
    try {
      const response = await axios.post(`${this.baseUrl}/prompt`, { prompt: workflow });
      return response.data;
    } catch (error) {
      console.error('프롬프트 전송 중 오류:', error);
      throw error;
    }
  }

  // services/comfyui.js의 waitForImage 함수 수정
  async waitForImage(promptId) {
    const maxAttempts = 60;
    const delayMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(`${this.baseUrl}/history/${promptId}`);
        const history = response.data;
        
        if (promptId in history) {
          const promptData = history[promptId];
          
          if (promptData.status?.status_str === 'success') {
            // 노드 12 (배경제거) 결과 확인
            if (promptData.outputs["12"]?.images?.length > 0) {
              const image = promptData.outputs["12"].images[0];
              const subfolderPath = image.subfolder ? `${image.subfolder}/` : '';
              return `${subfolderPath}${image.filename}`;
            }
            
            // 노드 68 (Preview) 결과 확인
            if (promptData.outputs["68"]?.images?.length > 0) {
              const image = promptData.outputs["68"].images[0];
              const subfolderPath = image.subfolder ? `${image.subfolder}/` : '';
              return `${subfolderPath}${image.filename}`;
            }

            // 모든 노드 확인
            for (const nodeId in promptData.outputs) {
              if (promptData.outputs[nodeId].images?.length > 0) {
                const image = promptData.outputs[nodeId].images[0];
                const subfolderPath = image.subfolder ? `${image.subfolder}/` : '';
                return `${subfolderPath}${image.filename}`;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error while checking history:', error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    throw new Error('이미지 생성 타임아웃');
  }
}


module.exports = ComfyUIService;