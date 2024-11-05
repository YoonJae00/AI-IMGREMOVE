const express = require('express');
const router = express.Router();
const multer = require('multer');

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
        console.log('=== 요청 시작 ===');
        console.log('Background Type:', req.body.backgroundType);
        console.log('Custom Background:', req.files.background ? '있음' : '없음');
        
        const files = req.files.photos;
        let backgroundType = req.body.backgroundType || 'transparent';
        const customBackground = req.files.background?.[0];
        
        if (backgroundType === 'custom' && customBackground) {
            backgroundType = 'background';
            console.log('Background Type 변경됨:', backgroundType);
        }
        
        console.log('처리할 이미지 수:', files.length);
        
        const results = await Promise.allSettled(
            files.map(file => ComfyUIManager.processImage(backgroundType, file, customBackground))
        );

        const successResults = results
            .filter(r => r.status === 'fulfilled')
            .map((result, index) => ({
                url: result.value.url,
                originalName: files[index].originalname
            }));

        const failedCount = results.filter(r => r.status === 'rejected').length;

        res.json({
            success: true,
            data: successResults,
            failedCount,
            totalCount: files.length
        });
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
        const result = await ComfyUIManager.processImage('studio', req.file);
        res.json({
            success: true,
            data: {
                url: result.url,
                previewUrl: result.previewUrl
            }
        });
    } catch (error) {
        console.error('이미지 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;