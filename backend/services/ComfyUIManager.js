const FormData = require('form-data');
const fetch = require('node-fetch');

class ComfyUIManager {
    constructor() {
        this.baseUrl = process.env.COMFYUI_URL || 'http://221.148.97.237:8188';
        this.workflows = {
            noBackground: require('../workflows/rmbg_noback_api.json'),
            withBackground: require('../workflows/rmbg_v3_api.json'),
            studio: require('../workflows/pro_v3_api.json')
        };
    }
    

    async processImage(type, file) {
        try {
            // 이미지 업로드
            const uploadResult = await this.uploadImage(file);
            
            // 워크플로우 실행
            const workflow = this.getWorkflow(type);
            const modifiedWorkflow = this.modifyWorkflow(workflow, {
                inputImage: uploadResult.name
            });
            
            const promptResult = await this.executeWorkflow(modifiedWorkflow);
            
            // 결과 대기
            return await this.waitForResult(promptResult.prompt_id);
        } catch (error) {
            console.error('이미지 처리 중 오류:', error);
            throw error;
        }
    }

    async uploadImage(imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile.buffer, {
                filename: imageFile.originalname,
                contentType: imageFile.mimetype
            });

            const response = await fetch(`${this.baseUrl}/upload/image`, {
                method: 'POST',
                body: formData,
                timeout: 30000, // 30초 타임아웃 설정
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`이미지 업로드 실패: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('ComfyUI 업로드 오류:', error);
            throw new Error('ComfyUI 서버 연결 실패. 잠시 후 다시 시도해주세요.');
        }
    }

    async executeWorkflow(workflow) {
        const response = await fetch(`${this.baseUrl}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: workflow,
                client_id: `studio_${Date.now()}`
            })
        });

        if (!response.ok) {
            throw new Error('워크플로우 실행 실패');
        }

        return await response.json();
    }

    async waitForResult(promptId) {
        const maxRetries = 20;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                const response = await fetch(`${this.baseUrl}/history/${promptId}`);
                const result = await response.json();
                
                if (result?.[promptId]?.status?.status_str === 'success' && 
                    result[promptId].outputs?.['72']?.images?.[0]) {
                    
                    const image = result[promptId].outputs['72'].images[0];
                    return {
                        url: `${this.baseUrl}/view?filename=${image.filename}&type=${image.type}&subfolder=${image.subfolder || ''}`,
                        previewUrl: `${this.baseUrl}/view?filename=${image.filename}&type=${image.type}&subfolder=${image.subfolder || ''}&preview=true`
                    };
                }
            } catch (error) {
                console.error('결과 조회 중 오류:', error);
            }
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            retryCount++;
        }
        
        throw new Error('이미지 생성 시간 초과');
    }

    getWorkflow(type) {
        switch(type) {
            case 'transparent':
                return this.workflows.noBackground;
            case 'background':
                return this.workflows.withBackground;
            case 'studio':
                return this.workflows.studio;
            default:
                throw new Error('지원하지 않는 워크플로우 타입');
        }
    }

    getCurrentWorkflowType() {
        return this.currentWorkflowType;
    }

    modifyWorkflow(workflow, options) {
        // 워크플로우 깊은 복사
        const modifiedWorkflow = JSON.parse(JSON.stringify(workflow));
        
        // LoadImage 노드 찾기 (입력 이미지)
        const loadImageNode = Object.entries(modifiedWorkflow).find(
            ([_, node]) => node.class_type === "LoadImage"
        )?.[0];

        if (loadImageNode) {
            modifiedWorkflow[loadImageNode].inputs.image = options.inputImage;
        }

        // 배경 이미지가 있는 경우 (rmbg_v3_api.json 워크플로우용)
        if (options.backgroundImage) {
            const backgroundLoadNode = Object.entries(modifiedWorkflow).find(
                ([id, node]) => 
                    node.class_type === "LoadImage" && 
                    id !== loadImageNode
            )?.[0];

            if (backgroundLoadNode) {
                modifiedWorkflow[backgroundLoadNode].inputs.image = options.backgroundImage;
            }
        }

        return modifiedWorkflow;
    }
}

module.exports = new ComfyUIManager(); 