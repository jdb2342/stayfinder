// src/routes/bookings.route.js
// 예약(Booking) 관련 라우터
// - 게스트: 예약 생성, 내 예약 목록 조회, 예약 취소
// - 호스트: 내 숙소에 들어온 예약 목록 조회, 예약 상태 변경

const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth, bookingsController.createBooking);
router.get('/me', auth, bookingsController.getMyBookings);
router.get('/host/me', auth, bookingsController.getHostBookings);
router.get('/:id', auth, bookingsController.getBookingById);
router.patch('/:id/status', auth, bookingsController.updateBookingStatus);
router.delete('/:id', auth, bookingsController.cancelBooking);

module.exports = router;
