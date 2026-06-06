// ============================================
//   SHOP THẮNG — Giỏ hàng & Thanh toán
// ============================================

function addToCart(id) {
  const product = State.products.find(p => p.id === id);
  if (!product) return;

  const item = State.cart.find(i => i.id === id);
  if (item) {
    item.qty++;
  } else {
    State.cart.push({ ...product, qty: 1 });
  }

  render();
  showToast('Đã thêm "' + product.name + '" vào giỏ! 🛒');
}

function changeQty(id, delta) {
  const item = State.cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    State.cart = State.cart.filter(i => i.id !== id);
  }
  render();
}

function removeFromCart(id) {
  const item = State.cart.find(i => i.id === id);
  if (item) showToast('"' + item.name + '" đã được xóa khỏi giỏ.');
  State.cart = State.cart.filter(i => i.id !== id);
  render();
}

function toggleCart() {
  State.showCartPanel = !State.showCartPanel;
  render();
}

function applyCoupon() {
  const code = (State.couponCode || '').trim().toUpperCase();
  if (!code) {
    State.couponMsg = 'Vui lòng nhập mã giảm giá.';
    State.couponApplied = null;
    render();
    return;
  }

  if (COUPONS[code]) {
    State.couponApplied = COUPONS[code];
    State.couponMsg = '✅ ' + COUPONS[code].label + ' đã được áp dụng!';
  } else {
    State.couponApplied = null;
    State.couponMsg = '❌ Mã không hợp lệ hoặc đã hết hạn.';
  }
  render();
}

function doCheckout() {
  if (State.cart.length === 0) return;

  const now = new Date();
  const date = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const order = {
    id: 'DH' + String(State.orderCount++).padStart(3, '0'),
    date,
    items: State.cart.map(i => ({ ...i })),
    subtotal: cartSubtotal(),
    discount: cartDiscount(),
    total: cartTotal(),
    coupon: State.couponApplied ? State.couponCode.toUpperCase() : null,
  };

  // Lưu đơn hàng vào tài khoản người dùng
  if (State.user) {
    const u = currentUser();
    if (u) u.orders.push(order);
  }

  // Reset giỏ hàng
  State.cart = [];
  State.couponApplied = null;
  State.couponCode = '';
  State.couponMsg = '';
  State.showCartPanel = false;

  render();
  showToast('🎉 Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
}

// ====== Build Cart Panel HTML ======

function buildCartPanel() {
  if (!State.showCartPanel) return '';

  if (State.cart.length === 0) {
    return `
      <div class="cart-panel">
        <h3>🛒 Giỏ hàng</h3>
        <div class="empty-state">
          <span class="big-icon">🛒</span>
          Giỏ hàng đang trống.<br>
          <small>Hãy thêm sản phẩm để bắt đầu!</small>
        </div>
      </div>
    `;
  }

  const sub = cartSubtotal();
  const disc = cartDiscount();
  const total = cartTotal();

  return `
    <div class="cart-panel">
      <h3>🛒 Giỏ hàng (${cartQty()} sản phẩm)</h3>

      ${State.cart.map(item => `
        <div class="cart-item">
          <div class="ci-emoji">${item.emoji}</div>
          <div class="ci-info">
            <div class="ci-name">${item.name}</div>
            <div class="ci-price">${fmt(item.price)}</div>
            <div class="qty-row">
              <div class="qty-btn" onclick="changeQty(${item.id}, -1)">−</div>
              <span class="qty-val">${item.qty}</span>
              <div class="qty-btn" onclick="changeQty(${item.id}, 1)">+</div>
            </div>
          </div>
          <button class="rm-btn" onclick="removeFromCart(${item.id})" title="Xóa">×</button>
        </div>
      `).join('')}

      <!-- Mã giảm giá -->
      <div style="margin-top:16px">
        <div class="coupon-label">🏷️ Mã giảm giá:</div>
        <div class="coupon-row">
          <input
            id="coupon-inp"
            placeholder="VD: THANG10, SALE20, VIP30"
            value="${State.couponCode}"
            oninput="State.couponCode=this.value"
            onkeydown="if(event.key==='Enter') applyCoupon()"
          >
          <button class="btn btn-outline" onclick="applyCoupon()">Áp dụng</button>
        </div>
        ${State.couponMsg
          ? `<span class="${State.couponApplied ? 'badge-coupon-ok' : 'badge-coupon-err'}">${State.couponMsg}</span>`
          : '<span class="coupon-hint">Thử mã: THANG10 · SALE20 · VIP30</span>'
        }
      </div>

      <!-- Tổng tiền -->
      <div class="total-row" style="margin-top:16px">
        <span>Tạm tính</span>
        <span>${fmt(sub)}</span>
      </div>
      ${disc > 0 ? `
        <div class="total-row" style="color:var(--green-dark)">
          <span>${State.couponApplied.label}</span>
          <span>−${fmt(disc)}</span>
        </div>
      ` : ''}
      <div class="total-row final">
        <span>Tổng cộng</span>
        <span style="color:var(--green-dark)">${fmt(total)}</span>
      </div>

      <button class="btn btn-green btn-block" style="margin-top:14px" onclick="doCheckout()">
        💳 Thanh toán ngay
      </button>
    </div>
  `;
}

// ====== Build Order History Page ======

function buildOrders() {
  const u = currentUser();
  const orders = u ? u.orders : [];

  return `
    <div class="container">
      <div class="page-wrap">
        <div class="page-title">
          <button class="btn btn-outline" onclick="goShop()">← Quay lại</button>
          <h2>📦 Lịch sử đơn hàng</h2>
        </div>

        ${orders.length === 0
          ? `<div class="empty-state">
              <span class="big-icon">📦</span>
              Bạn chưa có đơn hàng nào.<br>
              <small>Mua sắm ngay để xem lịch sử đơn hàng!</small>
            </div>`
          : orders.slice().reverse().map(o => `
            <div class="order-card">
              <div class="order-top">
                <span class="order-id">#${o.id}</span>
                <span class="order-date">🕐 ${o.date}</span>
                <span class="badge-delivered">✅ Đã giao</span>
              </div>
              <div class="order-items">
                ${o.items.map(i => `${i.emoji} ${i.name} x${i.qty}`).join(' &nbsp;·&nbsp; ')}
              </div>
              <div class="order-total">
                Tổng: ${fmt(o.total)}
                ${o.discount > 0 ? `<span style="font-size:11px;color:var(--text-tertiary);font-weight:400;margin-left:6px">(đã giảm ${fmt(o.discount)})</span>` : ''}
                ${o.coupon ? `<span style="font-size:11px;color:var(--green);margin-left:6px">🏷️ ${o.coupon}</span>` : ''}
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
}
