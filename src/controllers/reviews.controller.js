// 리뷰(Review) 관련 컨트롤러
// - 게스트가 숙소에 남긴 리뷰 작성/수정/삭제
// - 숙소별 리뷰 조회, 내가 쓴 리뷰 목록 조회

const { Review, Listing, User } = require('../models');

// POST /reviews
exports.createReview = async (req, res) => {
  try {
    const user = req.user;
    const { listingId, rating, comment } = req.body;

    if (!listingId || !rating) {
      return res.status(400).json({ message: 'listingId and rating required' });
    }

    // 일단은 예약 여부 체크 안 하고 단순하게 감
    const review = await Review.create({
      listingId,
      guestId: user.id,
      rating,
      comment: comment || '',
    });

    return res.status(201).json(review);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create review' });
  }
};

// GET /reviews/listing/:listingId
exports.getReviewsByListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const reviews = await Review.findAll({
      where: { listingId },
      include: [{ model: User, as: 'guest', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });

    return res.json(reviews);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get reviews' });
  }
};

// GET /reviews/me
exports.getMyReviews = async (req, res) => {
  try {
    const user = req.user;

    const reviews = await Review.findAll({
      where: { guestId: user.id },
      include: [{ model: Listing, as: 'listing', attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']],
    });

    return res.json(reviews);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get my reviews' });
  }
};

// GET /reviews/:id
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        { model: Listing, as: 'listing', attributes: ['id', 'title'] },
        { model: User, as: 'guest', attributes: ['id', 'name'] },
      ],
    });

    if (!review) return res.status(404).json({ message: 'Review not found' });

    return res.json(review);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get review' });
  }
};

// PATCH /reviews/:id
exports.updateReview = async (req, res) => {
  try {
    const user = req.user;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.guestId !== user.id) {
      return res.status(403).json({ message: 'Not your review' });
    }

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();
    return res.json(review);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update review' });
  }
};

// DELETE /reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const user = req.user;

    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.guestId !== user.id) {
      return res.status(403).json({ message: 'Not your review' });
    }

    await review.destroy();
    return res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete review' });
  }
};
