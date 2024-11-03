const express = require('express');
const router = express.Router();
const multer = require('multer');
const ComfyUIManager = require('../services/ComfyUIManager');

router.post('/remove-background', multer().fields([
    { name: 'photos', maxCount: 50 },
    { name: 'background', maxCount: 1 }
]), async (req, res) => {
    try {
        const files = req.files.photos;
        const backgroundFile = req.files.background?.[0];
        const backgroundType = req.body.backgroundType || 'transparent';
        
        const results = await Promise.all(
            files.map(file => ComfyUIManager.processImage(backgroundType, file, backgroundFile))
        );

        res.json({
            success: true,
            data: results.map((result, index) => ({
                url: result.url,
                originalName: files[index].originalname
            }))
        });
    } catch (error) {
        console.error('이미지 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/studio-process', multer().single('image'), async (req, res) => {
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