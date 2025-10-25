require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

const app = express();

// 데이터베이스 연결
connectDB();

// 미들웨어
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'http://15.165.30.90'
    : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 정적 파일 제공 (업로드된 이미지)
app.use('/uploads', express.static('uploads'));

// 라우트
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/authors', require('./routes/authors'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/upload', require('./routes/upload'));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: '트렌드OS API 서버' });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ message: '요청하신 페이지를 찾을 수 없습니다.' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '서버 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
