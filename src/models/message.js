// Message 모델
// - 예약(Booking)을 기준으로 호스트와 게스트가 주고받는 메시지(채팅) 저장

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Message',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      bookingId: { type: DataTypes.INTEGER, allowNull: false },
      senderId: { type: DataTypes.INTEGER, allowNull: false },
      receiverId: { type: DataTypes.INTEGER, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
    },
    {
      tableName: 'messages',
      timestamps: true,
    }
  );

  return Message;
};
