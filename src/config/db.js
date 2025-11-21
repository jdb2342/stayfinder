// DB 연결 설정 (Sequelize + MySQL)
// .env 파일에 있는 DB_NAME, DB_USER, DB_PASSWORD, DB_HOST 정보를 읽어서
// Sequelize 인스턴스를 생성해 준다.

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // 사용할 DB 이름
  process.env.DB_USER, // DB 사용자 계정
  process.env.DB_PASSWORD, // DB 비밀번호
  {
    host: process.env.DB_HOST, // DB 호스트 (보통 localhost)
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
