// src/app.js

/**
 * [파일 설명]
 * Express App 설정 파일입니다.
 * 서버를 켜는 기능(listen)은 server.js에 있고,
 * 여기서는 요청을 처리하는 '로직'과 '설정'들만 정의하여 server.js로 내보냅니다.
 */

// ==========================================================
// 1. 모듈(라이브러리) 불러오기
// ==========================================================

// Node.js를 위한 웹 프레임워크 'express'를 가져옵니다.
const express = require('express');

// 'express' 함수를 실행하여 실제 앱 객체(app)를 생성합니다.
// 이 'app' 객체에 설정을 추가하고 라우터를 연결하게 됩니다.
const app = express();

// HTTP 요청 로그를 터미널에 찍어주는 'morgan' 라이브러리를 가져옵니다.
// (설치: npm install morgan)
const morgan = require('morgan');

// 브라우저의 보안 정책(CORS)을 해결해주는 'cors' 라이브러리를 가져옵니다.
// (설치: npm install cors)
const cors = require('cors');

// .env 파일에 정의된 환경변수(DB비번, 포트 등)를 process.env 로 불러옵니다.
require('dotenv').config();

// ==========================================================
// 2. 라우터 파일 불러오기
// ==========================================================
// 기능별로 분리해둔 라우터 파일들을 미리 가져옵니다.
// 아직 연결(use)은 안 된 상태이고, 변수에 담아두기만 합니다.

const authRoutes = require('./routes/auth.route');       // 회원가입, 로그인 관련
const listingsRoutes = require('./routes/listings.route'); // 숙소 등록, 조회 관련
const bookingsRoutes = require('./routes/bookings.route'); // 예약 관련
const reviewsRoutes = require('./routes/reviews.route');   // 리뷰 관련
const wishlistsRoutes = require('./routes/wishlists.route'); // 위시리스트 관련
const messagesRoutes = require('./routes/messages.route'); // 메시지 관련

// ==========================================================
// 3. 전역 미들웨어 설정 (모든 요청에 공통 적용)
// ==========================================================

// [로깅 미들웨어]
// 클라이언트가 요청을 보낼 때마다 터미널에 로그를 남깁니다.
// 'dev' 옵션은 "GET /listings 200 15.234ms" 형태로 깔끔하게 보여줍니다.
// 반드시 라우터 설정보다 위쪽에 있어야 모든 요청을 기록할 수 있습니다.
app.use(morgan('dev'));

// [JSON 파싱 미들웨어]
// 프론트엔드에서 body에 담아 보낸 JSON 데이터를 해석해서 req.body에 넣어줍니다.
// 이 코드가 없으면 POST 요청 시 req.body가 undefined로 나옵니다.
app.use(express.json());

// [CORS 설정 미들웨어]
// 다른 도메인(예: 리액트 localhost:3000)에서 이 서버(localhost:4000)로
// API 요청을 보낼 수 있도록 허용합니다.
app.use(cors({
    origin: 'http://localhost:3000', // 리액트 개발 서버 주소만 딱 집어서 허용
    credentials: true                // 쿠키나 세션 정보를 포함한 요청을 허용할지 여부
}));

// ==========================================================
// 4. 라우터 연결 (URL 주소 분기 처리)
// ==========================================================

// "/auth"로 시작하는 주소는 authRoutes 파일로 보냅니다.
// 예: POST /auth/login 요청이 오면 -> authRoutes 안의 /login 처리 로직이 실행됨.
app.use('/auth', authRoutes);

// "/listings"로 시작하는 주소는 listingsRoutes 파일로 보냅니다.
app.use('/listings', listingsRoutes);

// "/bookings"로 시작하는 주소는 bookingsRoutes 파일로 보냅니다.
app.use('/bookings', bookingsRoutes);

// "/reviews"로 시작하는 주소는 reviewsRoutes 파일로 보냅니다.
app.use('/reviews', reviewsRoutes);

// "/wishlists"로 시작하는 주소는 wishlistsRoutes 파일로 보냅니다.
app.use('/wishlists', wishlistsRoutes);

// "/messages"로 시작하는 주소는 messagesRoutes 파일로 보냅니다.
app.use('/messages', messagesRoutes);

// ==========================================================
// 5. 기본 헬스 체크 (Health Check)
// ==========================================================

// 단순히 도메인(루트 /)으로 접속했을 때 서버가 살아있는지 확인하는 용도입니다.
// 브라우저에 localhost:4000 접속 시 JSON 메시지가 뜨면 성공입니다.
app.get('/', (req, res) => {
  res.json({ message: 'StayFinder API running' });
});

// ==========================================================
// 6. 전역 에러 핸들러 (Error Handler)
// ==========================================================

// 위에서 처리되지 못하고 에러가 발생했거나,
// 라우터에서 next(err)를 호출하여 에러를 던졌을 때 이곳으로 옵니다.
// 파라미터 4개 (err, req, res, next)를 반드시 다 써야 에러 핸들러로 인식됩니다.
app.use((err, req, res, next) => {
  // 1. 서버 터미널에 에러 내용을 출력합니다 (디버깅용).
  console.error(err);

  // 2. 에러 객체에 status 코드가 있으면 그걸 쓰고, 없으면 500(서버 내부 에러)을 씁니다.
  const status = err.status || 500;

  // 3. 에러 메시지가 있으면 그걸 쓰고, 없으면 기본 메시지를 씁니다.
  const message = err.message || 'Internal server error';

  // 4. 최종적으로 클라이언트(프론트엔드)에게 JSON 형식으로 에러 응답을 보냅니다.
  return res.status(status).json({ message });
});

// ==========================================================
// 7. 모듈 내보내기
// ==========================================================

// 설정이 완료된 app 객체를 밖으로 내보냅니다.
// 이걸 server.js 파일에서 불러와서(require) 서버를 켜게(listen) 됩니다.
module.exports = app;