// WishlistItem 모델
// - 위시리스트와 숙소 사이의 N:M 관계를 나타내는 조인 테이블
// - 어떤 위시리스트에 어떤 숙소가 들어있는지 저장

module.exports = (sequelize, DataTypes) => {
  const WishlistItem = sequelize.define(
    'WishlistItem',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      wishlistId: { type: DataTypes.INTEGER, allowNull: false },
      listingId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: 'wishlist_items',
      timestamps: true,
    }
  );

  return WishlistItem;
};
