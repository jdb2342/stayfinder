// 위시리스트(Wishlist) 관련 컨트롤러
// - 사용자가 "저장한 숙소 리스트(폴더)"를 관리하는 기능
// - 위시리스트 생성, 항목 추가/삭제, 내 위시리스트 목록 조회 등

const { Wishlist, WishlistItem, Listing } = require('../models');

/**
 * POST /wishlists
 * 내 위시리스트(폴더)를 하나 생성한다.
 * - body: { name }
 */
exports.createWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name 필드는 필수입니다.' });
    }

    const wishlist = await Wishlist.create({ userId, name });

    return res.status(201).json(wishlist);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create wishlist' });
  }
};

/**
 * POST /wishlists/:id/items
 * 특정 위시리스트에 숙소를 한 개 추가한다.
 * - params: id (wishlistId)
 * - body: { listingId }
 */
// POST /wishlists/:id/items
// POST /wishlists/:id/items  - 지정한 위시리스트에 숙소 한 개 추가
exports.addWishlistItem = async (req, res) => {
  try {
    const user = req.user;

    // params 로 들어오는 id는 문자열이므로 숫자로 변환
    const wishlistId = Number(req.params.id);
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ message: 'listingId is required' });
    }

    // 1) 이 위시리스트가 "내 것"인지 확인
    const wishlist = await Wishlist.findOne({
      where: { id: wishlistId, userId: user.id },
    });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // 2) 숙소가 실제로 존재하는지 확인 (안전용)
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // 3) 중복 추가 방지 – 이미 있으면 그 레코드 그대로 사용
    let item = await WishlistItem.findOne({
      where: { wishlistId, listingId },
    });
    if (!item) {
      item = await WishlistItem.create({ wishlistId, listingId });
    }

    // mysql2 + INTEGER 컬럼이면 여기 값은 숫자(number)로 들어온다
    return res.status(201).json({
      id: item.id,
      wishlistId: item.wishlistId, // ← number (테스트에서 기대하는 타입)
      listingId: item.listingId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to add item to wishlist' });
  }
};

/**
 * DELETE /wishlists/:id/items/:itemId
 * 위시리스트에서 특정 항목을 제거한다.
 */
exports.removeWishlistItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: wishlistId, itemId } = req.params;

    // 내가 소유한 위시리스트인지 확인
    const wishlist = await Wishlist.findOne({
      where: { id: wishlistId, userId },
    });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const item = await WishlistItem.findOne({
      where: { id: itemId, wishlistId },
    });

    if (!item) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    await item.destroy();
    return res.status(200).json({ message: 'Item removed from wishlist' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to remove wishlist item' });
  }
};

/**
 * GET /wishlists
 * 로그인한 사용자의 모든 위시리스트 + 각 위시리스트 내 숙소 목록을 반환.
 * 테스트에서 기대하는 엔드포인트: 200 OK, 배열 형태.
 */
exports.getMyWishlists = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlists = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Listing,
          as: 'listings',
          through: { attributes: [] }, // 조인 테이블 컬럼은 숨김
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    // 결과가 없어도 200 + 빈 배열 반환
    return res.status(200).json(wishlists);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get wishlists' });
  }
};

/**
 * GET /wishlists/:id
 * 위시리스트 하나만 상세 조회
 */
exports.getWishlistById = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlistId = req.params.id;

    const wishlist = await Wishlist.findOne({
      where: { id: wishlistId, userId },
      include: [
        {
          model: Listing,
          as: 'listings',
          through: { attributes: [] },
        },
      ],
    });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    return res.status(200).json(wishlist);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get wishlist' });
  }
};
