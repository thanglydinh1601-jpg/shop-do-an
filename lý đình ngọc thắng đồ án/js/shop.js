// ============================================
//   SHOP THẮNG — Trang cửa hàng
// ============================================

function setFilter(cat) {
  State.filter = cat;
  render();
}

function setSearch(val) {
  State.search = val;
  render();
}

function setSort(val) {
  State.sortBy = val;
  render();
}

function openDetail(id) {
  State.detailProduct = State.products.find(p => p.id === id);
  State.showAddModal = false;
  State.editProduct = null;
  render();
}

function closeDetail() {
  State.detailProduct = null;
  render();
}

// ====== Build Shop Page ======

function buildShop() {
  const products = getFilteredProducts();

  return `
    <div class="container">
      ${buildNav()}
      ${isOwner() ? buildAdminBar() : ''}
      ${buildBanner()}
      ${buildFilterBar()}
      ${buildAdvFilter()}
      ${buildProductGrid(products)}
      ${buildCartPanel()}
    </div>

    ${State.detailProduct ? buildDetailModal() : ''}
    ${State.showAddModal ? buildProductModal(null) : ''}
    ${State.editProduct ? buildProductModal(State.editProduct) : ''}
  `;
}

// ====== Nav ======

function buildNav() {
  const authSection = State.user
    ? `<div style="display:flex;align-items:center;gap:8px">
        <div class="user-badge">
          ${isOwner() ? '👑 ' : '👤 '}
          <span>${State.user.username}</span>
        </div>
        ${!isOwner()
          ? `<button class="btn btn-outline" style="padding:5px 10px;font-size:12px" onclick="goOrders()">📦 Đơn hàng</button>`
          : ''
        }
        <span class="logout-icon" onclick="doLogout()" title="Đăng xuất">⏏</span>
      </div>`
    : `<button class="btn btn-outline" onclick="goAuth()">👤 Đăng nhập</button>`;

  return `
    <nav class="nav">
      <div class="logo" onclick="goShop()">Shop <span>Thắng</span></div>
      <div class="nav-right">
        <div class="search-box">
          <span style="font-size:14px;color:var(--text-tertiary)">🔍</span>
          <input
            placeholder="Tìm sản phẩm..."
            value="${State.search}"
            oninput="setSearch(this.value)"
          >
        </div>
        <button class="btn btn-green" onclick="toggleCart()">
          🛒 Giỏ hàng
          <span class="cart-count">${cartQty()}</span>
        </button>
        ${authSection}
      </div>
    </nav>
  `;
}

// ====== Banner ======

function buildBanner() {
  return `
    <div class="banner">
      <div>
        <h1>Mua sắm thông minh<br>Tiết kiệm mỗi ngày ✨</h1>
        <p>Hàng ngàn sản phẩm chất lượng — Giao hàng tận nơi</p>
      </div>
      <button class="btn btn-green" style="white-space:nowrap"
        onclick="document.getElementById('grid').scrollIntoView({behavior:'smooth'})">
        Mua ngay →
      </button>
    </div>
  `;
}

// ====== Filter Bar ======

function buildFilterBar() {
  return `
    <div class="filter-bar">
      ${getCategories().map(c => `
        <button class="filter-btn ${c === State.filter ? 'active' : ''}" onclick="setFilter('${c}')">
          ${c}
        </button>
      `).join('')}
    </div>
  `;
}

// ====== Advanced Filter ======

function buildAdvFilter() {
  return `
    <div class="adv-filter">
      <label>Sắp xếp:</label>
      <select onchange="setSort(this.value)">
        <option value="default" ${State.sortBy === 'default' ? 'selected' : ''}>Mặc định</option>
        <option value="asc"     ${State.sortBy === 'asc'     ? 'selected' : ''}>Giá tăng dần</option>
        <option value="desc"    ${State.sortBy === 'desc'    ? 'selected' : ''}>Giá giảm dần</option>
        <option value="sale"    ${State.sortBy === 'sale'    ? 'selected' : ''}>Đang giảm giá</option>
      </select>
      <label>Giá từ:</label>
      <input type="number" placeholder="0" value="${State.minPrice}"
        oninput="State.minPrice=this.value;render()">
      <label>đến:</label>
      <input type="number" placeholder="∞" value="${State.maxPrice}"
        oninput="State.maxPrice=this.value;render()">
      <label>₫</label>
    </div>
  `;
}

// ====== Product Grid ======

function buildProductGrid(products) {
  if (products.length === 0) {
    return `
      <div class="products-grid" id="grid">
        <div class="empty-state" style="grid-column:1/-1">
          <span class="big-icon">🔍</span>
          Không tìm thấy sản phẩm phù hợp.<br>
          <small>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</small>
        </div>
      </div>
    `;
  }

  return `
    <div class="products-grid" id="grid">
      ${products.map(p => buildProductCard(p)).join('')}
    </div>
  `;
}

// Helper: render hình ảnh hoặc emoji của sản phẩm
function renderProductMedia(p, size) {
  if (p.image) {
    return `<img src="${p.image}" alt="${p.name}"
      style="width:100%;height:${size}px;object-fit:cover;display:block;">`;
  }
  return `<span style="font-size:${Math.round(size*0.37)}px">${p.emoji || '📦'}</span>`;
}

function buildProductCard(p) {
  const salePercent = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  return `
    <div class="product-card" onclick="openDetail(${p.id})">
      <div class="product-img" style="${p.image ? 'padding:0;overflow:hidden' : ''}">
        ${renderProductMedia(p, 130)}
        ${isOwner()
          ? `<button class="admin-edit-btn" onclick="event.stopPropagation(); openEdit(${p.id})">✏️ Sửa</button>`
          : ''
        }
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">
          ${p.oldPrice ? `<span class="old-price">${fmt(p.oldPrice)}</span>` : ''}
          ${fmt(p.price)}
        </div>
        <div class="product-actions">
          ${salePercent > 0
            ? `<span class="badge-sale">−${salePercent}%</span>`
            : '<span></span>'
          }
          <button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id})">+ Thêm</button>
        </div>
        ${isOwner()
          ? `<button class="btn btn-danger" style="width:100%;margin-top:8px;font-size:12px"
               onclick="event.stopPropagation(); deleteProduct(${p.id})">
               🗑️ Xóa
             </button>`
          : ''
        }
      </div>
    </div>
  `;
}

// ====== Product Detail Modal ======

function buildDetailModal() {
  const p = State.detailProduct;
  const salePercent = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  return `
    <div class="overlay" onclick="closeDetail()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <span style="font-size:12px;color:var(--text-tertiary);background:var(--bg-secondary);padding:3px 10px;border-radius:99px">${p.cat}</span>
          <button class="modal-close" onclick="closeDetail()">×</button>
        </div>

        ${p.image
          ? `<div style="border-radius:var(--radius);overflow:hidden;margin-bottom:16px;max-height:240px">
               <img src="${p.image}" alt="${p.name}" style="width:100%;height:240px;object-fit:cover;display:block;">
             </div>`
          : `<div class="detail-emoji">${p.emoji || '📦'}</div>`
        }

        <div class="detail-name">${p.name}</div>
        <div class="detail-desc">${p.desc || 'Sản phẩm chất lượng cao từ Shop Thắng.'}</div>

        <div class="detail-price-row">
          <span class="detail-price">${fmt(p.price)}</span>
          ${p.oldPrice ? `<span class="old-price" style="font-size:14px">${fmt(p.oldPrice)}</span>` : ''}
          ${salePercent > 0 ? `<span class="badge-sale">−${salePercent}%</span>` : ''}
        </div>

        <button class="btn btn-green btn-block" onclick="addToCart(${p.id}); closeDetail()">
          🛒 Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  `;
}
