const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes/api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// CORS 설정 업데이트
app.use(cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Accept', 'Content-Type', 'Cache-Control']
}));

app.use(express.json());
app.use(express.static('public'));

// 연결 유지를 위한 설정
app.use((req, res, next) => {
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

// 에러 핸들링 미들웨어 추가
app.use((err, req, res, next) => {
    console.error('서버 오류:', err);
    res.status(500).json({ 
        success: false, 
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    });
});

app.use('/api', apiRouter);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
}); 