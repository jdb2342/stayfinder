// src/routes/listings.route.js
// 숙소(Listing) 관련 라우터
// - 전체 숙소 목록 / 상세 조회 (공개)
// - 숙소 등록/수정/삭제 (호스트 전용)
// - 내 숙소 목록 조회
const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listings.controller');
const auth = require('../middlewares/auth.middleware');

// 공개
router.get('/', listingsController.getListings);
router.get('/:id', listingsController.getListingById);

// 호스트 권한 필요
router.post('/', auth, listingsController.createListing);
router.patch('/:id', auth, listingsController.updateListing);
router.delete('/:id', auth, listingsController.deleteListing);
router.get('/host/me/mine', auth, listingsController.getMyListings);

module.exports = router;
