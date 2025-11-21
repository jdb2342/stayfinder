module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    'Booking',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      listingId: { type: DataTypes.INTEGER, allowNull: false },
      guestId: { type: DataTypes.INTEGER, allowNull: false },
      checkIn: { type: DataTypes.DATEONLY, allowNull: false },
      checkOut: { type: DataTypes.DATEONLY, allowNull: false },
      totalPrice: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM('REQUESTED', 'CONFIRMED', 'DECLINED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'REQUESTED',
      },
    },
    {
      tableName: 'bookings',
      timestamps: true,
    }
  );

  return Booking;
};
