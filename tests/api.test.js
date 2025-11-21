// tests/api.test.js
// -----------------------------------------------------
// StayFinder 통합 테스트 파일
// - beforeAll 에서 호스트/게스트/숙소/예약 한 번에 셋업
// - 각 describe 블록이 "라우터별 핵심 API 테스트" 역할을 함
//   /auth, /listings, /bookings, /reviews, /wishlists, /messages
// -----------------------------------------------------

const request = require('supertest');
const app = require('../src/app'); // 실제 서버는 안 띄우고 Express 앱만 가져옴
const db = require('../src/models'); // Sequelize 인스턴스

// 테스트에서 재사용할 토큰/ID 들
let hostToken;
let guestToken;
let listingId;
let bookingId;
let wishlistId;

// -----------------------------
// 공통 테스트 데이터 셋업
// -----------------------------
beforeAll(async () => {
  // ⚠️ test 실행 시마다 DB를 새로 생성 (테이블 DROP 후 CREATE)
  // 실 서비스 DB 쓰지 말고, 테스트 전용 DB를 쓰는 게 원칙이지만
  // 과제용이라 여기선 그냥 stayfinder 를 초기화해도 무방.
  await db.sequelize.sync({ force: true });

  // 1) 호스트/게스트 회원가입
  await request(app).post('/auth/register').send({
    email: 'host@test.com',
    password: '12345678',
    name: '테스트 호스트',
    role: 'host',
  });

  await request(app).post('/auth/register').send({
    email: 'guest@test.com',
    password: '12345678',
    name: '테스트 게스트',
    role: 'guest',
  });

  // 2) 로그인해서 JWT 토큰 발급받기
  const hostLoginRes = await request(app).post('/auth/login').send({
    email: 'host@test.com',
    password: '12345678',
  });
  hostToken = hostLoginRes.body.token;

  const guestLoginRes = await request(app).post('/auth/login').send({
    email: 'guest@test.com',
    password: '12345678',
  });
  guestToken = guestLoginRes.body.token;

  // 3) 호스트가 숙소 1개 생성
  const listingRes = await request(app)
    .post('/listings')
    .set('Authorization', `Bearer ${hostToken}`)
    .send({
      title: '테스트 숙소',
      description: '테스트용 숙소 설명',
      address: '서울시 어딘가',
      pricePerNight: 50000,
      maxGuests: 2,
    });

  listingId = listingRes.body.id;

  // 4) 게스트가 예약 1개 생성
  const bookingRes = await request(app)
    .post('/bookings')
    .set('Authorization', `Bearer ${guestToken}`)
    .send({
      listingId,
      checkIn: '2025-12-24',
      checkOut: '2025-12-26',
      guestCount: 2,
    });

  bookingId = bookingRes.body.id;
}, 30000); // (최대 30초까지 기다리도록 타임아웃 늘려줌)

// 테스트 끝난 뒤 DB 커넥션 정리
afterAll(async () => {
  await db.sequelize.close();
});

// -----------------------------
// /auth 라우터
// -----------------------------
describe('Auth Router', () => {
  test('로그인 시 JWT 토큰을 발급한다', () => {
    // 이미 beforeAll에서 로그인해서 토큰을 받아왔으므로,
    // 여기서는 토큰이 존재하는지만 간단하게 확인
    expect(hostToken).toBeDefined();
    expect(guestToken).toBeDefined();
  });
});

// -----------------------------
// /listings 라우터
// -----------------------------
describe('Listings Router', () => {
  test('GET /listings 는 숙소 목록을 반환한다', async () => {
    const res = await request(app).get('/listings');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // 위에서 만든 숙소가 최소 1개는 있어야 한다
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /listings/:id 는 특정 숙소를 반환한다', async () => {
    const res = await request(app).get(`/listings/${listingId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(listingId);
    expect(res.body.title).toBe('테스트 숙소');
  });
});

// -----------------------------
// /bookings 라우터
// -----------------------------
describe('Bookings Router', () => {
  test('GET /bookings/me 는 게스트의 예약 목록을 반환한다', async () => {
    const res = await request(app)
      .get('/bookings/me')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /bookings/host/me 는 호스트 기준 예약 목록을 반환한다', async () => {
    const res = await request(app)
      .get('/bookings/host/me')
      .set('Authorization', `Bearer ${hostToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// -----------------------------
// /reviews 라우터
// -----------------------------
describe('Reviews Router', () => {
  test('POST /reviews 는 리뷰를 생성한다', async () => {
    const res = await request(app)
      .post('/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId,
        rating: 5,
        comment: '아주 좋았습니다.',
      });

    expect(res.status).toBe(201);
    expect(res.body.listingId).toBe(listingId);
    expect(res.body.rating).toBe(5);
  });

  test('GET /reviews/listing/:id 는 해당 숙소의 리뷰 목록을 반환한다', async () => {
    const res = await request(app).get(`/reviews/listing/${listingId}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // 방금 생성한 리뷰가 1개 이상 있어야 함
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

// -----------------------------
// /wishlists 라우터
// -----------------------------
describe('Wishlists Router', () => {
  test('POST /wishlists 는 위시리스트를 생성한다', async () => {
    const res = await request(app)
      .post('/wishlists')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ name: '테스트 위시리스트' });

    expect(res.status).toBe(201);
    wishlistId = res.body.id;
    expect(wishlistId).toBeDefined();
  });

  test('POST /wishlists/:id/items 는 숙소를 위시리스트에 추가한다', async () => {
    const res = await request(app)
      .post(`/wishlists/${wishlistId}/items`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ listingId });

    expect(res.status).toBe(201);
    expect(res.body.wishlistId).toBe(wishlistId);
    expect(res.body.listingId).toBe(listingId);
  });

  test('GET /wishlists 는 내 위시리스트 목록을 반환한다', async () => {
    const res = await request(app)
      .get('/wishlists')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// -----------------------------
// /messages 라우터
// -----------------------------
describe('Messages Router', () => {
  test('POST /messages 는 예약에 대한 메시지를 생성한다', async () => {
    const res = await request(app)
      .post('/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId,
        content: '체크인 시간은 언제인가요?',
      });

    expect(res.status).toBe(201);
    expect(res.body.bookingId).toBe(bookingId);
    expect(res.body.content).toContain('체크인 시간');
  });

  test('GET /messages/me 는 내가 주고받은 메시지 목록을 반환한다', async () => {
    const res = await request(app)
      .get('/messages/me')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
