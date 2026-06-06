// ============================================
//   SHOP THẮNG — Xác thực người dùng
// ============================================

function goAuth() {
  State.page = 'auth';
  State.authErr = '';
  State.authSuccess = '';
  State.formData = {};
  render();
}

function goShop() {
  State.page = 'shop';
  State.showCartPanel = false;
  State.detailProduct = null;
  State.showAddModal = false;
  State.editProduct = null;
  render();
}

function goOrders() {
  State.page = 'orders';
  render();
}

function setAuthMode(mode) {
  State.authMode = mode;
  State.authErr = '';
  State.authSuccess = '';
  render();
}

function doLogin() {
  const username = document.getElementById('f-user').value.trim();
  const password = document.getElementById('f-pass').value;

  if (!username || !password) {
    State.authErr = 'Vui lòng điền đầy đủ thông tin.';
    render();
    return;
  }

  const found = State.users.find(u => u.username === username && u.password === password);
  if (!found) {
    State.authErr = 'Sai tên đăng nhập hoặc mật khẩu.';
    render();
    return;
  }

  State.user = found;
  State.page = 'shop';
  State.authErr = '';
  render();
  showToast('Chào mừng, ' + username + '! 👋');
}

function doRegister() {
  const username = document.getElementById('f-user').value.trim();
  const password = document.getElementById('f-pass').value;
  const password2 = document.getElementById('f-pass2').value;

  if (!username || !password) {
    State.authErr = 'Vui lòng điền đầy đủ thông tin.';
    render();
    return;
  }

  if (username.length < 3) {
    State.authErr = 'Tên đăng nhập phải có ít nhất 3 ký tự.';
    render();
    return;
  }

  if (password.length < 3) {
    State.authErr = 'Mật khẩu phải có ít nhất 3 ký tự.';
    render();
    return;
  }

  if (password !== password2) {
    State.authErr = 'Mật khẩu xác nhận không khớp.';
    render();
    return;
  }

  if (State.users.find(u => u.username === username)) {
    State.authErr = 'Tên đăng nhập đã tồn tại.';
    render();
    return;
  }

  State.users.push({ username, password, orders: [] });
  State.authSuccess = 'Đăng ký thành công! Mời bạn đăng nhập.';
  State.authMode = 'login';
  State.authErr = '';
  State.formData = { username };
  render();
}

function doLogout() {
  const name = State.user.username;
  State.user = null;
  State.cart = [];
  State.couponApplied = null;
  State.couponCode = '';
  State.couponMsg = '';
  State.showCartPanel = false;
  render();
  showToast('Đã đăng xuất. Hẹn gặp lại, ' + name + '!');
}

// ====== Build Auth Page HTML ======

function buildAuth() {
  const isLogin = State.authMode === 'login';

  return `
    <div class="container">
      <div class="auth-wrap">
        <div class="auth-logo">
          <div class="logo" onclick="goShop()">Shop <span>Thắng</span></div>
          <p style="font-size:13px;color:var(--text-secondary);margin-top:6px">
            ${isLogin ? 'Đăng nhập để mua sắm và xem đơn hàng' : 'Tạo tài khoản mới để bắt đầu mua sắm'}
          </p>
        </div>

        <div class="tabs">
          <div class="tab ${isLogin ? 'active' : ''}" onclick="setAuthMode('login')">Đăng nhập</div>
          <div class="tab ${!isLogin ? 'active' : ''}" onclick="setAuthMode('register')">Đăng ký</div>
        </div>

        <div class="auth-card">
          <div class="field">
            <label>Tên đăng nhập</label>
            <input id="f-user" placeholder="Nhập tên đăng nhập" value="${State.formData.username || ''}"
              onkeydown="if(event.key==='Enter') ${isLogin ? 'doLogin()' : 'doRegister()'}">
          </div>

          <div class="field">
            <label>Mật khẩu</label>
            <input id="f-pass" type="password" placeholder="••••••••"
              onkeydown="if(event.key==='Enter') ${isLogin ? 'doLogin()' : 'doRegister()'}">
          </div>

          ${!isLogin ? `
          <div class="field">
            <label>Xác nhận mật khẩu</label>
            <input id="f-pass2" type="password" placeholder="••••••••"
              onkeydown="if(event.key==='Enter') doRegister()">
          </div>` : ''}

          ${State.authErr ? `<div class="msg-err">⚠️ ${State.authErr}</div>` : ''}
          ${State.authSuccess ? `<div class="msg-ok">✅ ${State.authSuccess}</div>` : ''}

          <button class="btn btn-green btn-block" style="margin-top:16px"
            onclick="${isLogin ? 'doLogin()' : 'doRegister()'}">
            ${isLogin ? '🔑 Đăng nhập' : '✨ Tạo tài khoản'}
          </button>

          <div class="auth-footer">
            ${isLogin
              ? 'Chưa có tài khoản? <a onclick="setAuthMode(\'register\')">Đăng ký ngay</a>'
              : 'Đã có tài khoản? <a onclick="setAuthMode(\'login\')">Đăng nhập</a>'
            }
          </div>
        </div>
      </div>
    </div>
  `;
}
