// src/routes/wishlists.route.js
// 위시리스트(Wishlist) 라우터
// - 위시리스트(폴더) 생성/조회
// - 위시리스트에 숙소 추가/삭제

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const wishlistsController = require('../controllers/wishlists.controller');

// 위시리스트 생성
// POST /wishlists
router.post('/', auth, wishlistsController.createWishlist);

// 내 위시리스트 목록
// GET /wishlists
router.get('/', auth, wishlistsController.getMyWishlists);

// 특정 위시리스트 상세 조회
// GET /wishlists/:id
router.get('/:id', auth, wishlistsController.getWishlistById);

// 위시리스트에 숙소 추가
// POST /wishlists/:id/items
router.post('/:id/items', auth, wishlistsController.addWishlistItem);

// 위시리스트에서 특정 항목 삭제
// DELETE /wishlists/:id/items/:itemId
router.delete(
  '/:id/items/:itemId',
  auth,
  wishlistsController.removeWishlistItem
);

module.exports = router;
