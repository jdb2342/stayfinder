// 인증 미들웨어
// - Authorization: Bearer <JWT> 헤더를 검사하고
// - 유효한 토큰이면 req.user 에 사용자 정보를 넣어 다음 핸들러로 넘김

const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization']; // 1) Authorization 헤더 유무 체크
  if (!authHeader) return res.status(401).json({ message: 'No token' });

  const [type, token] = authHeader.split(' '); // 2) "Bearer <token>" 형식인지 확인
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // 3) 토큰 검증 및 payload 복호화
    const user = await User.findByPk(payload.userId); // 4) payload.userId 기준으로 실제 DB 에서 사용자 조회
    if (!user) return res.status(401).json({ message: 'User not found' }); // 5) 이후 라우터에서 편하게 쓰도록 req.user 에 저장

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
