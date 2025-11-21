// Review 모델
// - 게스트가 숙소에 남긴 리뷰 정보
// - 평점(rating)과 코멘트(comment)를 저장
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    'Review',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      listingId: { type: DataTypes.INTEGER, allowNull: false },
      guestId: { type: DataTypes.INTEGER, allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false },
      comment: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'reviews',
      timestamps: true,
    }
  );

  return Review;
};
