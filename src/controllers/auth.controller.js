// 인증/회원 관련 컨트롤러
// - 회원가입, 로그인(JWT 발급)
// - 내 정보 조회/수정/삭제const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    const existing = await User.findOne({ where: { email } }); // 이메일 중복 체크
    if (existing) {
      return res.status(400).json({ message: 'Email already used' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // 비밀번호 해시 생성 (saltRounds = 10)
    //새 유저 생성
    const user = await User.create({
      email,
      passwordHash,
      name,
      role: role || 'guest', // 기본값 guest
    });

    return res.status(201).json({ id: user.id, email: user.email }); // 비밀번호 해시는 응답에 포함하지 않고 최소 정보만 반환
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Register failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } }); //이메일 사용자 조회
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash); //입력 비밀번호와 저장된 해시 비교
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      //JWT 토큰 생성 (userId + role 포함)
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      //토큰과 함께 최소 유저 정보 반환
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  //인증된 사용자 자신 정보 조회,authMiddleware 가 req.user 에 넣어준 정보를 그대로 리턴
  const user = req.user;
  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
};

exports.updateMe = async (req, res) => {
  //내 정보 수정 (이름, 역할 정도만)
  try {
    const user = req.user;
    const { name, role } = req.body;

    if (name) user.name = name;
    if (role) user.role = role;

    await user.save();

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Update failed' });
  }
};

exports.deleteMe = async (req, res) => {
  //내 계정 삭제
  try {
    const user = req.user;
    await user.destroy();
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Delete failed' });
  }
};
