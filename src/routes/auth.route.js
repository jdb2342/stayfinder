// src/routes/auth.route.js
// 인증/회원 관련 라우터
// - 회원가입, 로그인
// - 내 정보 조회/수정/삭제

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 회원가입 / 로그인
router.post('/register', authController.register);
router.post('/login', authController.login);

// 내 정보
router.get('/me', authMiddleware, authController.getMe);
router.patch('/me', authMiddleware, authController.updateMe);
router.delete('/me', authMiddleware, authController.deleteMe);

module.exports = router;
