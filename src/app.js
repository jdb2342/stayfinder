// src/app.js
// 익스프레스 앱 설정 파일
// - JSON 파싱 미들웨어 등록
// - 각 기능별 라우터(auth, listings, bookings, ...) 마운트
// - 기본 헬스 체크 엔드포인트 및 에러 핸들러 정의

const express = require('express');
const app = express();
require('dotenv').config();

// 라우터
const authRoutes = require('./routes/auth.route');
const listingsRoutes = require('./routes/listings.route');
const bookingsRoutes = require('./routes/bookings.route');
const reviewsRoutes = require('./routes/reviews.route');
const wishlistsRoutes = require('./routes/wishlists.route');
const messagesRoutes = require('./routes/messages.route');

app.use(express.json());

// 라우터 등록
app.use('/auth', authRoutes);
app.use('/listings', listingsRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/wishlists', wishlistsRoutes);
app.use('/messages', messagesRoutes);

// 헬스 체크
app.get('/', (req, res) => {
  res.json({ message: 'StayFinder API running' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
