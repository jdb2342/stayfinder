// src/routes/messages.route.js
// 메시지(Message) 라우터
// - 예약을 기준으로 호스트/게스트 간 메시지 전송 & 조회

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const messagesController = require('../controllers/messages.controller');

// 메시지 작성 (★ 테스트에서 사용)
router.post('/', auth, messagesController.createMessage);

// 내가 주고받은 모든 메시지 (★ 테스트에서 사용)
router.get('/me', auth, messagesController.getMyMessages);

// 편의상 /messages 도 /me 와 동일하게 동작하도록 추가
router.get('/', auth, messagesController.getMyMessages);

// 특정 예약에 대한 대화 목록
router.get('/booking/:id', auth, messagesController.getMessagesForBooking);

// 메시지 삭제 (예시용)
router.delete('/:id', auth, messagesController.deleteMessage);

module.exports = router;
