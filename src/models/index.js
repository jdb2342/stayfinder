// Sequelize 모델 초기화 & 관계(Association) 설정 파일
// - 개별 모델(user, listing, booking, ...)을 불러오고
// - hasMany / belongsTo / belongsToMany 등 관계를 정의한다.

const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Listing = require('./listing')(sequelize, Sequelize.DataTypes);
db.Booking = require('./booking')(sequelize, Sequelize.DataTypes);
db.Review = require('./review')(sequelize, Sequelize.DataTypes);
db.Wishlist = require('./wishlist')(sequelize, Sequelize.DataTypes);
db.WishlistItem = require('./wishlistItem')(sequelize, Sequelize.DataTypes);
db.Message = require('./message')(sequelize, Sequelize.DataTypes);

const { User, Listing, Booking, Review, Wishlist, WishlistItem, Message } = db;

// User - Listing (Host)
User.hasMany(Listing, { foreignKey: 'hostId', as: 'listings' });
Listing.belongsTo(User, { foreignKey: 'hostId', as: 'host' });

// Listing - Booking
Listing.hasMany(Booking, { foreignKey: 'listingId', as: 'bookings' });
Booking.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

// User(guest) - Booking
User.hasMany(Booking, { foreignKey: 'guestId', as: 'guestBookings' });
Booking.belongsTo(User, { foreignKey: 'guestId', as: 'guest' });

// Listing - Review
Listing.hasMany(Review, { foreignKey: 'listingId', as: 'reviews' });
Review.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

// User(guest) - Review
User.hasMany(Review, { foreignKey: 'guestId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'guestId', as: 'guest' });

// User - Wishlist
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlists' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Wishlist - Listing (N:M via WishlistItem)
Wishlist.belongsToMany(Listing, {
  through: WishlistItem,
  foreignKey: 'wishlistId',
  otherKey: 'listingId',
  as: 'listings',
});
Listing.belongsToMany(Wishlist, {
  through: WishlistItem,
  foreignKey: 'listingId',
  otherKey: 'wishlistId',
  as: 'wishlists',
});

// Booking - Message
Booking.hasMany(Message, { foreignKey: 'bookingId', as: 'messages' });
Message.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// User - Message (sender/receiver)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

module.exports = db;
