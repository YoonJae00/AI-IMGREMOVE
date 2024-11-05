const axios = require('axios');
const FormData = require('form-data');

class ComfyUIManager {
    constructor() {
        this.servers = [
            'http://221.148.97.237:8188',
            'http://221.148.97.237:8189',
            'http://221.148.97.237:8190',
            'http://221.148.97.237:8191'
        ];
        this.serverQueues = new Map(
            this.servers.map(server => [server, []])
        );
        this.serverStatus = new Map(
            this.servers.map(server => [server, { healthy: true }])
        );
        this.currentBatchIndex = 0;
        this.totalBatches = this.servers.length;
        this.workflows = {
            noBackground: require('../workflows/rmbg_noback_api.json'),
            withBackground: require('../workflows/rmbg_v3_api.json'),
            studio: require('../workflows/pro_v3_api.json')
        };
        
        // 서버 상태 즉시 체크 후 주기적으로 체크
        this.checkServersHealth();
        setInterval(() => this.checkServersHealth(), 30000);
    }

    async checkServersHealth() {
        for (const server of this.servers) {
            try {
                const response = await axios.get(`${server}/system_stats`);
                this.serverStatus.set(server, {
                    healthy: true,
                    gpu_usage: response.data.gpu?.gpu_usage || 0
                });
            } catch (error) {
                this.serverStatus.set(server, { healthy: false });
            }
        }
    }

    getNextServer() {
        const availableServers = this.servers.filter(server => 
            this.serverStatus.get(server)?.healthy
        );

        if (availableServers.length === 0) {
            throw new Error('사용 가능한 서버가 없습니다.');
        }

        // 현재 배치에 해당하는 서버 선택
        const selectedServer = availableServers[this.currentBatchIndex % availableServers.length];
        
        // 다음 배치로 이동
        this.currentBatchIndex++;
        
        return selectedServer;
    }

    async processImage(type, file, customBackground = null, progressCallback = null) {
        console.log('=== processImage 시작 ===');
        console.log('Type:', type);
        
        const serverUrl = this.getNextServer();
        this.serverQueues.get(serverUrl).push(file);

        try {
            if (progressCallback) progressCallback(10);
            const uploadResult = await this.uploadImage(file, serverUrl);
            
            if (progressCallback) progressCallback(30);
            let backgroundUploadResult = null;
            if (type === 'background' && customBackground) {
                backgroundUploadResult = await this.uploadImage(customBackground, serverUrl);
            }
            
            if (progressCallback) progressCallback(50);
            const workflow = this.getWorkflow(type);
            const modifiedWorkflow = this.modifyWorkflow(workflow, {
                inputImage: uploadResult.name,
                backgroundImage: backgroundUploadResult?.name
            });
            
            if (progressCallback) progressCallback(70);
            const promptResult = await this.executeWorkflow(modifiedWorkflow, serverUrl);
            
            if (progressCallback) progressCallback(90);
            const result = await this.waitForResult(promptResult.prompt_id, serverUrl);
            
            if (progressCallback) progressCallback(100);
            return {
                ...result,
                serverUrl
            };
        } finally {
            const queue = this.serverQueues.get(serverUrl);
            const index = queue.indexOf(file);
            if (index > -1) queue.splice(index, 1);
        }
    }

    async uploadImage(imageFile, serverUrl) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile.buffer, {
                filename: imageFile.originalname,
                contentType: imageFile.mimetype
            });

            const response = await axios.post(`${serverUrl}/upload/image`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Accept': 'application/json'
                },
                timeout: 30000
            });

            return response.data;
        } catch (error) {
            console.error('ComfyUI 업로드 오류:', error);
            throw new Error('ComfyUI 서버 연결 실패. 잠시 후 다시 시도해주세요.');
        }
    }

    async executeWorkflow(workflow, serverUrl) {
        const response = await axios.post(`${serverUrl}/prompt`, {
            prompt: workflow,
            client_id: `studio_${Date.now()}`
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data;
    }

    async waitForResult(promptId, serverUrl) {
        const maxRetries = 60;  // 최대 3분 대기
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                const response = await axios.get(`${serverUrl}/history/${promptId}`);
                const result = response.data;
                console.log('comfyui port :', serverUrl);
                // 실행 상태 확인
                if (result?.[promptId]?.status?.status_str === 'error') {
                    throw new Error('이미지 생성 실패');
                }
                
                // 52번 노드(SaveImage)의 출력 확인
                const outputs = result?.[promptId]?.outputs;
                if (outputs?.['52']?.images?.[0]) {
                    const image = outputs['52'].images[0];
                    return {
                        url: `${serverUrl}/view?filename=${image.filename}&type=${image.type}&subfolder=${image.subfolder || ''}`,
                        previewUrl: `${serverUrl}/view?filename=${image.filename}&type=${image.type}&subfolder=${image.subfolder || ''}&preview=true`
                    };
                }

                // 진행 상태 로깅
                console.log('처리 상태:', result?.[promptId]?.status?.status_str);
                console.log('52번 노드 상태:', outputs?.['52'] ? '있음' : '없음');
                
            } catch (error) {
                console.error('결과 조회 중 오류:', error.message);
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
        const modifiedWorkflow = JSON.parse(JSON.stringify(workflow));
        
        // 입력 이미지 노드 (11번)
        const inputImageNode = Object.entries(modifiedWorkflow).find(
            ([id, node]) => node.class_type === "LoadImage" && id === "11"
        )?.[0];

        if (inputImageNode) {
            modifiedWorkflow[inputImageNode].inputs.image = options.inputImage;
        }

        // 배경 이미지가 있는 경우 (66번 노드)
        if (options.backgroundImage) {
            const backgroundNode = "66";  // 배경 이미지 노드는 항상 66번
            if (modifiedWorkflow[backgroundNode]) {
                modifiedWorkflow[backgroundNode].inputs.image = options.backgroundImage;
            }
        }

        return modifiedWorkflow;
    }
}

module.exports = new ComfyUIManager(); 