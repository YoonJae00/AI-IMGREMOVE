const express = require('express');
const router = express.Router();
const multer = require('multer');
const ComfyUIManager = require('../services/ComfyUIManager');

router.post('/remove-background', multer().array('photos'), async (req, res) => {
    try {
        const files = req.files;
        const backgroundType = req.body.backgroundType || 'transparent';
        
        const results = await Promise.all(
            files.map(file => ComfyUIManager.processImage(backgroundType, file))
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