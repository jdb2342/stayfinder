// Listing 모델
// - 호스트가 올린 숙소(방) 정보
// - 가격, 최대 수용 인원, 상태(active/inactive) 등을 관리

module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define(
    'Listing',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      hostId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: false },
      pricePerNight: { type: DataTypes.INTEGER, allowNull: false },
      maxGuests: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'listings',
      timestamps: true,
    }
  );

  return Listing;
};
