// ============================================
//   SHOP THẮNG — Dữ liệu sản phẩm & mã giảm giá
// ============================================

const INITIAL_PRODUCTS = [
  { id: 1,  name: 'Áo thun basic',       emoji: '👕', price: 149000, oldPrice: 199000, cat: 'Thời trang', desc: 'Áo thun cotton 100%, thoáng mát, phù hợp mặc hàng ngày.' },
  { id: 2,  name: 'Quần jeans slim',     emoji: '👖', price: 399000, oldPrice: 550000, cat: 'Thời trang', desc: 'Quần jeans dáng slim fit, co giãn tốt, nhiều màu sắc.' },
  { id: 3,  name: 'Giày sneaker',        emoji: '👟', price: 599000, oldPrice: 799000, cat: 'Giày dép',   desc: 'Sneaker thể thao đế cao su chống trơn, thiết kế trẻ trung.' },
  { id: 4,  name: 'Túi tote canvas',     emoji: '👜', price: 229000, oldPrice: null,   cat: 'Phụ kiện',  desc: 'Túi vải canvas chắc chắn, dung tích lớn, nhiều màu.' },
  { id: 5,  name: 'Kính mát UV400',      emoji: '🕶️', price: 189000, oldPrice: 259000, cat: 'Phụ kiện',  desc: 'Kính mát chống tia UV400, phù hợp đi biển và dạo phố.' },
  { id: 6,  name: 'Tai nghe không dây',  emoji: '🎧', price: 899000, oldPrice: 1200000,cat: 'Điện tử',   desc: 'Tai nghe bluetooth 5.0, pin 30 giờ, âm thanh sống động.' },
  { id: 7,  name: 'Bình giữ nhiệt',      emoji: '🥤', price: 179000, oldPrice: null,   cat: 'Gia dụng',  desc: 'Giữ nóng 12h, giữ lạnh 24h, dung tích 500ml.' },
  { id: 8,  name: 'Đèn ngủ LED',         emoji: '💡', price: 129000, oldPrice: 169000, cat: 'Gia dụng',  desc: 'Đèn LED cảm ứng, điều chỉnh độ sáng, tiết kiệm điện.' },
  { id: 9,  name: 'Sách self-help',      emoji: '📚', price: 89000,  oldPrice: null,   cat: 'Sách',      desc: 'Tuyển tập sách kỹ năng sống bán chạy nhất năm.' },
  { id: 10, name: 'Ví da handmade',      emoji: '👛', price: 349000, oldPrice: 480000, cat: 'Phụ kiện',  desc: 'Ví da thật thủ công, bền đẹp, nhiều ngăn tiện lợi.' },
  { id: 11, name: 'Mũ bucket',           emoji: '🧢', price: 149000, oldPrice: null,   cat: 'Thời trang',desc: 'Mũ bucket thời trang unisex, chất liệu vải dày dặn.' },
  { id: 12, name: 'Chuột không dây',     emoji: '🖱️', price: 459000, oldPrice: 599000, cat: 'Điện tử',   desc: 'Chuột không dây 2.4GHz, DPI 1600, pin AA dùng 1 năm.' },
];

// Các mã giảm giá hợp lệ
const COUPONS = {
  'THANG10': { pct: 10, label: 'Giảm 10%' },
  'SALE20':  { pct: 20, label: 'Giảm 20%' },
  'VIP30':   { pct: 30, label: 'Giảm 30%' },
};

// Danh sách emoji cho chọn icon sản phẩm
const EMOJIS = [
  '👕','👖','👟','👜','🕶️','🎧','🥤','💡','📚','👛',
  '🧢','🖱️','📱','💻','⌚','🎒','👒','🧣','🧤','🥿',
  '👗','🧥','💄','🧴','🍀','🎁','📦','🛒','🎮','🏀',
];

// Tài khoản chủ shop (chỉ 1)
const OWNER = { username: 'thang', password: '123' };
