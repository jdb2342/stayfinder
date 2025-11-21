// 숙소(Listing) 관련 컨트롤러
// - 전체 숙소 목록 조회 (필터 포함)
// - 상세 조회, 생성, 수정, 비활성화(soft delete)
// - 호스트 본인 숙소 목록 조회
const { Listing, Review, User } = require('../models');
const { Op } = require('sequelize');

// GET /listings?minPrice=&maxPrice=&maxGuests=
exports.getListings = async (req, res) => {
  try {
    const { minPrice, maxPrice, maxGuests } = req.query;
    const where = { status: 'active' };

    // 가격 필터
    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight[Op.gte] = Number(minPrice);
      if (maxPrice) where.pricePerNight[Op.lte] = Number(maxPrice);
    }

    // 인원 필터
    if (maxGuests) {
      where.maxGuests = { [Op.gte]: Number(maxGuests) }; // ← 이게 정답
    }

    const listings = await Listing.findAll({
      where,
      include: [
        { model: Review, as: 'reviews', attributes: ['rating'] },
        { model: User, as: 'host', attributes: ['id', 'name'] },
      ],
    });

    return res.json(listings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get listings' });
  }
};

// GET /listings/:id
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [
        { model: Review, as: 'reviews' },
        { model: User, as: 'host', attributes: ['id', 'name'] },
      ],
    });

    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    return res.json(listing);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get listing' });
  }
};

// POST /listings (host only)
exports.createListing = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === 'guest') {
      return res.status(403).json({ message: 'Only host can create listing' });
    }

    const { title, description, address, pricePerNight, maxGuests } = req.body;

    const listing = await Listing.create({
      hostId: user.id,
      title,
      description,
      address,
      pricePerNight,
      maxGuests,
    });

    return res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create listing' });
  }
};

// PATCH /listings/:id (owner only)
exports.updateListing = async (req, res) => {
  try {
    const user = req.user;
    const listing = await Listing.findByPk(req.params.id);

    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.hostId !== user.id) {
      return res.status(403).json({ message: 'Not your listing' });
    }

    const { title, description, address, pricePerNight, maxGuests, status } =
      req.body;

    if (title) listing.title = title;
    if (description) listing.description = description;
    if (address) listing.address = address;
    if (pricePerNight) listing.pricePerNight = pricePerNight;
    if (maxGuests) listing.maxGuests = maxGuests;
    if (status) listing.status = status;

    await listing.save();

    return res.json(listing);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update listing' });
  }
};

// DELETE /listings/:id (soft delete: status=inactive)
exports.deleteListing = async (req, res) => {
  try {
    const user = req.user;
    const listing = await Listing.findByPk(req.params.id);

    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.hostId !== user.id) {
      return res.status(403).json({ message: 'Not your listing' });
    }

    listing.status = 'inactive';
    await listing.save();

    return res.json({ message: 'Listing deactivated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete listing' });
  }
};

// GET /host/me/listings
exports.getMyListings = async (req, res) => {
  try {
    const user = req.user;
    const listings = await Listing.findAll({
      where: { hostId: user.id },
    });
    return res.json(listings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get my listings' });
  }
};
