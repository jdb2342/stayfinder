// src/server.js
// 실제 서버 시작 파일
// - DB 연결 확인 (sequelize.authenticate())
// - 모델 동기화 (sequelize.sync())
// - 포트 바인딩 후 서버 리스닝 시작

const app = require('./app');
const db = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('DB connected');

    await db.sequelize.sync({ alter: true }); // 개발 초기에는 alter/sync 사용

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server', err);
  }
})();
