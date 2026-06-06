// ============================================
//   SHOP THẮNG — App Entry Point
// ============================================

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function render() {
  const app = document.getElementById('app');

  if (State.page === 'auth') {
    app.innerHTML = buildAuth();
    return;
  }

  if (State.page === 'orders') {
    app.innerHTML = buildOrders();
    return;
  }

  app.innerHTML = buildShop();
}

document.addEventListener('DOMContentLoaded', () => {
  render();
});
