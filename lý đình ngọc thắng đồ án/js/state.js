// ============================================
//   SHOP THẮNG — Quản lý trạng thái (State)
// ============================================

const State = {
  // Trang hiện tại: 'shop' | 'auth' | 'orders'
  page: 'shop',

  // Người dùng đang đăng nhập
  user: null,

  // Chế độ auth: 'login' | 'register'
  authMode: 'login',
  authErr: '',
  authSuccess: '',
  formData: {},

  // Danh sách người dùng (bao gồm owner)
  users: [
    { ...OWNER, orders: [] }
  ],

  // Sản phẩm
  products: INITIAL_PRODUCTS.map(p => ({ ...p })),
  nextId: INITIAL_PRODUCTS.length + 1,

  // Giỏ hàng
  cart: [],

  // Bộ lọc & tìm kiếm
  filter: 'Tất cả',
  search: '',
  sortBy: 'default',
  minPrice: '',
  maxPrice: '',

  // Coupon
  couponCode: '',
  couponApplied: null,
  couponMsg: '',

  // UI state
  showCartPanel: false,
  showAddModal: false,
  editProduct: null,
  detailProduct: null,
  selEmoji: '📦',

  // Đơn hàng
  orderCount: 1,
};

// ====== Helper functions ======

function fmt(n) {
  return Number(n).toLocaleString('vi-VN') + '₫';
}

function isOwner() {
  return State.user && State.user.username === OWNER.username;
}

function getCategories() {
  const all = State.products.map(p => p.cat);
  return ['Tất cả', ...new Set(all)];
}

function cartQty() {
  return State.cart.reduce((s, i) => s + i.qty, 0);
}

function cartSubtotal() {
  return State.cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function cartDiscount() {
  if (!State.couponApplied) return 0;
  return Math.round(cartSubtotal() * State.couponApplied.pct / 100);
}

function cartTotal() {
  return cartSubtotal() - cartDiscount();
}

function currentUser() {
  if (!State.user) return null;
  return State.users.find(u => u.username === State.user.username);
}

function getFilteredProducts() {
  let list = [...State.products];

  // Lọc danh mục
  if (State.filter !== 'Tất cả') {
    list = list.filter(p => p.cat === State.filter);
  }

  // Tìm kiếm
  if (State.search.trim()) {
    const q = State.search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }

  // Lọc giá
  if (State.minPrice !== '') {
    list = list.filter(p => p.price >= parseInt(State.minPrice));
  }
  if (State.maxPrice !== '') {
    list = list.filter(p => p.price <= parseInt(State.maxPrice));
  }

  // Sắp xếp
  if (State.sortBy === 'asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (State.sortBy === 'desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (State.sortBy === 'sale') {
    list = list.filter(p => p.oldPrice).concat(list.filter(p => !p.oldPrice));
  }

  return list;
}
