// User 모델
// - 서비스에 가입한 사용자 계정 정보 저장
// - 역할(role)에 따라 guest / host / both 구분

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM('guest', 'host', 'both'),
        allowNull: false,
        defaultValue: 'guest',
      },
    },
    {
      tableName: 'users',
      timestamps: true,
    }
  );

  return User;
};
