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
    

    async processImage(type, file, backgroundFile = null) {
        try {
            // 이미지 업로드
            const uploadResult = await this.uploadImage(file);
            let backgroundUploadResult = null;
            
            if (backgroundFile) {
                backgroundUploadResult = await this.uploadImage(backgroundFile);
            }
            
            // 워크플로우 실행
            const workflow = this.getWorkflow(type);
            const modifiedWorkflow = this.modifyWorkflow(workflow, {
                inputImage: uploadResult.name,
                backgroundImage: backgroundUploadResult?.name
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
        const maxRetries = 60;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                const response = await fetch(`${this.baseUrl}/history/${promptId}`);
                const result = await response.json();
                
                if (result?.[promptId]?.status?.status_str === 'success') {
                    const outputNode = result[promptId].outputs?.['72'] || result[promptId].outputs?.['52'];
                    if (outputNode?.images?.[0]) {
                        const image = outputNode.images[0];
                        return {
                            url: `${this.baseUrl}/view?filename=${image.filename}&type=${image.type}&subfolder=${image.subfolder || ''}`,
                            previewUrl: `${this.baseUrl}/view?filename=${image.filename}&type=${image.type}&subfolder=${image.subfolder || ''}&preview=true`
                        };
                    }
                } else if (result?.[promptId]?.status?.status_str === 'error') {
                    throw new Error('이미지 처리 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('결과 조회 중 오류:', error);
                throw error;
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
            case 'custom':
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
        const modifiedWorkflow = JSON.parse(JSON.stringify(workflow));
        
        // LoadImage 노드 찾기 (입력 이미지)
        const loadImageNode = Object.entries(modifiedWorkflow).find(
            ([_, node]) => node.class_type === "LoadImage"
        )?.[0];

        if (loadImageNode) {
            modifiedWorkflow[loadImageNode].inputs.image = options.inputImage;
        }

        // studio 모드일 때 추가 설정
        if (this.getCurrentWorkflowType() === 'studio') {
            // pro_v3_api.json의 특정 노드 설정
            if (modifiedWorkflow['16']) {
                modifiedWorkflow['16'].inputs.seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            }
        }

        return modifiedWorkflow;
    }
}

module.exports = new ComfyUIManager(); 