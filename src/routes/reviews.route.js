// src/routes/reviews.route.js
// 리뷰(Review) 라우터
// - 숙소별 리뷰 조회
// - 내가 쓴 리뷰 조회
// - 리뷰 생성/수정/삭제

const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews.controller');
const auth = require('../middlewares/auth.middleware');

// 내가 쓴 리뷰
router.get('/me', auth, reviewsController.getMyReviews);

// 특정 숙소 리뷰
router.get('/listing/:listingId', reviewsController.getReviewsByListing);

// 단일 리뷰
router.get('/:id', reviewsController.getReviewById);

// 생성/수정/삭제 (로그인 필요)
router.post('/', auth, reviewsController.createReview);
router.patch('/:id', auth, reviewsController.updateReview);
router.delete('/:id', auth, reviewsController.deleteReview);

module.exports = router;
