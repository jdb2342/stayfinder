// 예약(Booking) 관련 컨트롤러
// - 게스트: 예약 생성, 내 예약 목록, 예약 취소
// - 호스트: 내 숙소에 들어온 예약 목록, 예약 상태 변경
const { Booking, Listing, User } = require('../models');

// POST /bookings
//게스트가 특정 숙소에 대한 예약 생성
//body: { listingId, checkIn, checkOut, guestCount }
exports.createBooking = async (req, res) => {
  try {
    const user = req.user; //예약하려는 숙소 존재 여부 확인
    const { listingId, checkIn, checkOut, guestCount } = req.body;

    const listing = await Listing.findByPk(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const nights = //날짜 차이로 숙박 일 수 계산 (단순 계산: 체크아웃 - 체크인)
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    const totalPrice = listing.pricePerNight * Math.max(1, nights || 1); // 최소 1박 이상 금액 계산 (nights 가 0 이거나 NaN 이면 1로 처리)

    const booking = await Booking.create({
      //예약 레코드 생성
      listingId,
      guestId: user.id,
      checkIn,
      checkOut,
      totalPrice,
    });

    return res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create booking' });
  }
};

// GET /bookings/me
//게스트 입장에서 "내가 예약한 목록" 조회
exports.getMyBookings = async (req, res) => {
  try {
    const user = req.user;

    const bookings = await Booking.findAll({
      where: { guestId: user.id },
      include: [{ model: Listing, as: 'listing' }],
    });

    return res.json(bookings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get my bookings' });
  }
};

// GET /bookings/host/me
//호스트 입장에서 "내 숙소에 들어온 예약들" 조회
exports.getHostBookings = async (req, res) => {
  try {
    const user = req.user;

    const bookings = await Booking.findAll({
      include: [
        {
          model: Listing,
          as: 'listing',
          where: { hostId: user.id }, // 현재 사용자가 호스트인 숙소들만
        },
      ],
    });

    return res.json(bookings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get host bookings' });
  }
};

// GET /bookings/:id
//예약 상세 조회(게스트/호스트 모두 조회 가능)
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Listing, as: 'listing' }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    return res.json(booking);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get booking' });
  }
};

// PATCH /bookings/:id/status
//호스트가 예약 상태를 변경 (REQUESTED → CONFIRMED / DECLINED 등)
//body: { status }
exports.updateBookingStatus = async (req, res) => {
  try {
    const user = req.user;
    const { status } = req.body;

    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Listing, as: 'listing' }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.listing.hostId !== user.id) {
      //예약의 숙소 호스트가 맞는지 확인
      return res.status(403).json({ message: 'Not host of this listing' });
    }

    booking.status = status;
    await booking.save();

    return res.json(booking);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update status' });
  }
};

// DELETE /bookings/:id (guest cancels), 게스트가 자신의 예약을 취소 (status = CANCELLED)
exports.cancelBooking = async (req, res) => {
  try {
    const user = req.user;

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.guestId !== user.id) {
      return res.status(403).json({ message: 'Not your booking' });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    return res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to cancel booking' });
  }
};
