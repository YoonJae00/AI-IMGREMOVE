const express = require('express');
const router = express.Router();
const multer = require('multer');
const StatsManager = require('../services/statsManager')


const upload = multer({
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

const uploadFields = upload.fields([
    { name: 'photos', maxCount: 50 },
    { name: 'background', maxCount: 1 }
]);

const uploadSingle = upload.single('image');

const ComfyUIManager = require('../services/ComfyUIManager');

router.post('/remove-background', uploadFields, async (req, res) => {
    try {
        const files = req.files.photos;
        StatsManager.incrementBackgroundRemoval(files.length);
        let backgroundType = req.body.backgroundType || 'transparent';
        const customBackground = req.files.background?.[0];
        
        if (backgroundType === 'custom' && customBackground) {
            backgroundType = 'background';
        }

        const totalImages = files.length;
        
        // 모든 이미지를 동시에 처리
        const processPromises = files.map((file, index) => 
            ComfyUIManager.processImage(backgroundType, file, customBackground)
                .then(result => ({
                    success: true,
                    data: [{
                        url: result.url,
                        originalName: file.originalname,
                        index: index
                    }],
                    progress: {
                        current: index + 1,
                        total: totalImages
                    }
                }))
                .catch(error => {
                    console.error(`이미지 처리 실패 (${index + 1}/${totalImages}):`, error);
                    return null;
                })
        );

        // 각 이미지가 처리될 때마다 결과 전송
        for await (const result of processPromises) {
            if (result) {
                res.write(JSON.stringify(result) + '\n');
            }
        }
        
        res.end();
    } catch (error) {
        console.error('이미지 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/studio-process', uploadSingle, async (req, res) => {
    try {
        StatsManager.incrementStudio();
        // SSE 헤더 설정
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'no-cache');
        
        // 진행 상황 업데이트 함수
        const updateProgress = (progress) => {
            res.write(JSON.stringify({ progress }) + '\n');
        };

        // 이미지 처리 시작
        const result = await ComfyUIManager.processImage('studio', req.file, null, updateProgress);
        
        // 최종 결과 전송
        res.write(JSON.stringify({
            success: true,
            data: {
                url: result.url,
                previewUrl: result.previewUrl
            }
        }) + '\n');
        
        res.end();
    } catch (error) {
        console.error('이미지 처리 중 오류:', error);
        res.write(JSON.stringify({
            success: false,
            error: error.message
        }) + '\n');
        res.end();
    }
});

module.exports = router;