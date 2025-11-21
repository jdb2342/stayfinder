// src/controllers/messages.controller.js
// 호스트/게스트 간 메시지(채팅) 관련 비즈니스 로직

const { Message, Booking, Listing } = require('../models');
const { Op } = require('sequelize');

/**
 * POST /messages
 * 현재 로그인한 사용자(게스트/호스트)가
 * 특정 예약에 대해 상대방에게 메시지를 보내는 API
 * - body: { bookingId, content }
 */
exports.createMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { bookingId, content } = req.body;

    if (!bookingId || !content) {
      return res
        .status(400)
        .json({ message: 'bookingId와 content는 필수입니다.' });
    }

    // 예약 + 숙소 정보 조회 (호스트 id 필요)
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Listing, as: 'listing' }],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // sender가 게스트면 → 호스트에게, 호스트면 → 게스트에게 보냄
    let receiverId;
    if (senderId === booking.guestId) {
      receiverId = booking.listing.hostId;
    } else if (senderId === booking.listing.hostId) {
      receiverId = booking.guestId;
    } else {
      // 예약과 아무 관련 없는 사용자는 메시지 불가 (테스트에서는 안 걸림)
      return res
        .status(400)
        .json({ message: '예약과 관련된 사용자만 메시지를 보낼 수 있습니다.' });
    }

    const message = await Message.create({
      bookingId,
      senderId,
      receiverId,
      content,
    });

    // ★ 테스트 기대값: 201 Created
    return res.status(201).json(message);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create message' });
  }
};

/**
 * GET /messages/me
 * 내가 보낸/받은 모든 메시지를 조회하는 API
 * - 테스트에서 이 엔드포인트를 사용
 */
exports.getMyMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      order: [['createdAt', 'ASC']],
    });

    // 결과 없어도 200 + 빈 배열
    return res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to get messages' });
  }
};

/**
 * GET /messages/booking/:id
 * 특정 예약에 대한 대화 내용만 조회 (보고서용 보너스 API)
 */
exports.getMessagesForBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const messages = await Message.findAll({
      where: {
        bookingId,
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      order: [['createdAt', 'ASC']],
    });

    return res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Failed to get messages for booking' });
  }
};

/**
 * DELETE /messages/:id
 * 내가 보낸 메시지를 삭제하는 간단한 예시 API
 */
exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res
        .status(403)
        .json({ message: '본인이 보낸 메시지만 삭제할 수 있습니다.' });
    }

    await message.destroy();
    return res.status(200).json({ message: 'Message deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete message' });
  }
};
