// Wishlist 모델
// - 사용자가 저장해둔 숙소 모음(폴더) 자체를 의미
// - 예: "여름휴가용", "서울 출장용" 같은 리스트

module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define(
    'Wishlist',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: 'wishlists',
      timestamps: true,
    }
  );

  return Wishlist;
};
