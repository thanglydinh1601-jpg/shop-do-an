// ============================================
//   SHOP THẮNG — Quản trị sản phẩm (Admin)
// ============================================

// Lưu ảnh tạm thời khi đang thêm/sửa
State.previewImage = null;

function buildAdminBar() {
  return `
    <div class="admin-bar">
      <span>👑 Chế độ quản trị — Shop Thắng</span>
      <button class="btn btn-green" onclick="openAdd()">
        ➕ Thêm sản phẩm
      </button>
    </div>
  `;
}

function openAdd() {
  State.showAddModal = true;
  State.editProduct = null;
  State.detailProduct = null;
  State.selEmoji = '📦';
  State.previewImage = null;
  render();
}

function openEdit(id) {
  const product = State.products.find(p => p.id === id);
  if (!product) return;
  State.editProduct = { ...product };
  State.showAddModal = false;
  State.detailProduct = null;
  State.selEmoji = product.emoji;
  State.previewImage = product.image || null;
  render();
}

function closeModal() {
  State.showAddModal = false;
  State.editProduct = null;
  State.previewImage = null;
  render();
}

function selectEmoji(emoji, productId) {
  State.selEmoji = emoji;
  // Khi chọn emoji thì xóa ảnh preview
  State.previewImage = null;
  if (productId && State.editProduct) {
    State.editProduct = { ...State.editProduct, emoji, image: null };
  }
  // Cập nhật UI không render lại toàn bộ để tránh mất focus
  document.querySelectorAll('.emoji-opt').forEach(el => el.classList.remove('sel'));
  const target = document.querySelector(`.emoji-opt[data-emoji="${emoji}"]`);
  if (target) target.classList.add('sel');
  updateImagePreview();
}

// Xử lý khi người dùng chọn file ảnh
function handleImageUpload(input) {
  const file = input.files[0];
  if (!file) return;

  // Kiểm tra loại file
  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn file hình ảnh (JPG, PNG, GIF, WEBP...)');
    return;
  }

  // Kiểm tra kích thước file (tối đa 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    State.previewImage = e.target.result; // base64
    State.selEmoji = null; // Tắt emoji khi có ảnh
    if (State.editProduct) {
      State.editProduct = { ...State.editProduct, image: e.target.result, emoji: null };
    }
    updateImagePreview();
    // Bỏ chọn tất cả emoji
    document.querySelectorAll('.emoji-opt').forEach(el => el.classList.remove('sel'));
  };
  reader.readAsDataURL(file);
}

// Xóa ảnh đã chọn, quay về emoji
function removeImage() {
  State.previewImage = null;
  State.selEmoji = '📦';
  if (State.editProduct) {
    State.editProduct = { ...State.editProduct, image: null, emoji: '📦' };
  }
  const input = document.getElementById('m-img');
  if (input) input.value = '';
  updateImagePreview();
  // Reset emoji selection
  document.querySelectorAll('.emoji-opt').forEach(el => el.classList.remove('sel'));
  const defaultOpt = document.querySelector('.emoji-opt[data-emoji="📦"]');
  if (defaultOpt) defaultOpt.classList.add('sel');
}

// Cập nhật vùng preview ảnh mà không render lại toàn bộ
function updateImagePreview() {
  const previewArea = document.getElementById('img-preview-area');
  const emojiSection = document.getElementById('emoji-section');
  if (!previewArea) return;

  if (State.previewImage) {
    previewArea.innerHTML = `
      <div class="img-preview-wrap">
        <img src="${State.previewImage}" alt="Preview" class="img-preview">
        <button class="img-remove-btn" onclick="removeImage()" title="Xóa ảnh">✕</button>
      </div>
      <p class="img-hint" style="color:var(--green-dark)">✅ Ảnh đã được chọn</p>
    `;
    if (emojiSection) emojiSection.style.opacity = '0.4';
  } else {
    previewArea.innerHTML = `<p class="img-hint">Chưa có ảnh — sẽ dùng icon bên dưới</p>`;
    if (emojiSection) emojiSection.style.opacity = '1';
  }
}

function saveAdd() {
  const name  = document.getElementById('m-name').value.trim();
  const price = parseInt(document.getElementById('m-price').value);
  const old   = document.getElementById('m-old').value;
  const cat   = document.getElementById('m-cat').value.trim();
  const desc  = document.getElementById('m-desc').value.trim();

  if (!name || !price || !cat) {
    alert('Vui lòng điền đầy đủ tên, giá và danh mục!');
    return;
  }

  const newProduct = {
    id: State.nextId++,
    name,
    emoji: State.previewImage ? null : (State.selEmoji || '📦'),
    image: State.previewImage || null,
    price,
    oldPrice: old && parseInt(old) > price ? parseInt(old) : null,
    cat,
    desc: desc || 'Sản phẩm chất lượng cao từ Shop Thắng.',
  };

  State.products.push(newProduct);
  State.showAddModal = false;
  State.previewImage = null;
  render();
  showToast('Đã thêm sản phẩm "' + name + '"!');
}

function saveEdit(id) {
  const name  = document.getElementById('m-name').value.trim();
  const price = parseInt(document.getElementById('m-price').value);
  const old   = document.getElementById('m-old').value;
  const cat   = document.getElementById('m-cat').value.trim();
  const desc  = document.getElementById('m-desc').value.trim();

  if (!name || !price || !cat) {
    alert('Vui lòng điền đầy đủ tên, giá và danh mục!');
    return;
  }

  const image = State.previewImage || null;
  const emoji = image ? null : (State.selEmoji || '📦');

  State.products = State.products.map(p =>
    p.id === id
      ? { ...p, name, emoji, image, price,
          oldPrice: old && parseInt(old) > price ? parseInt(old) : null,
          cat, desc: desc || p.desc }
      : p
  );

  State.cart = State.cart.map(i =>
    i.id === id ? { ...i, name, emoji, image, price } : i
  );

  State.editProduct = null;
  State.previewImage = null;
  render();
  showToast('Đã cập nhật sản phẩm "' + name + '"!');
}

function deleteProduct(id) {
  const product = State.products.find(p => p.id === id);
  if (!product) return;
  if (!confirm('Bạn có chắc muốn xóa "' + product.name + '"?')) return;
  State.products = State.products.filter(p => p.id !== id);
  State.cart = State.cart.filter(i => i.id !== id);
  render();
  showToast('Đã xóa "' + product.name + '"');
}

function buildProductModal(product) {
  const isEdit = !!product;
  const emoji  = State.previewImage ? null : (isEdit ? product.emoji : State.selEmoji) || '📦';
  const existingImage = State.previewImage || (isEdit ? product.image : null);

  return `
    <div class="overlay" onclick="closeModal()">
      <div class="modal" onclick="event.stopPropagation()" style="max-width:460px;max-height:90vh;overflow-y:auto">
        <div class="modal-header">
          <h3>${isEdit ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}</h3>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>

        <div class="field">
          <label>Tên sản phẩm *</label>
          <input id="m-name" placeholder="VD: Áo thun trắng"
            value="${isEdit ? product.name : ''}">
        </div>

        <div class="field">
          <label>Mô tả sản phẩm</label>
          <input id="m-desc" placeholder="Mô tả ngắn về sản phẩm"
            value="${isEdit && product.desc ? product.desc : ''}">
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="field">
            <label>Giá bán (₫) *</label>
            <input id="m-price" type="number" placeholder="149000"
              value="${isEdit ? product.price : ''}">
          </div>
          <div class="field">
            <label>Giá gốc (₫)</label>
            <input id="m-old" type="number" placeholder="199000"
              value="${isEdit && product.oldPrice ? product.oldPrice : ''}">
          </div>
        </div>

        <div class="field">
          <label>Danh mục *</label>
          <input id="m-cat" placeholder="VD: Thời trang, Điện tử..."
            value="${isEdit ? product.cat : ''}">
        </div>

        <!-- UPLOAD ẢNH -->
        <div class="field">
          <label>🖼️ Hình ảnh sản phẩm</label>
          <div class="img-upload-box">
            <label class="img-upload-label" for="m-img">
              📁 Chọn ảnh từ máy tính
              <span style="font-size:11px;color:var(--text-tertiary);display:block;margin-top:2px">JPG, PNG, GIF, WEBP — tối đa 5MB</span>
            </label>
            <input type="file" id="m-img" accept="image/*"
              style="display:none" onchange="handleImageUpload(this)">
          </div>
          <div id="img-preview-area" style="margin-top:8px">
            ${existingImage
              ? `<div class="img-preview-wrap">
                   <img src="${existingImage}" alt="Preview" class="img-preview">
                   <button class="img-remove-btn" onclick="removeImage()" title="Xóa ảnh">✕</button>
                 </div>
                 <p class="img-hint" style="color:var(--green-dark)">✅ Ảnh đã được chọn</p>`
              : `<p class="img-hint">Chưa có ảnh — sẽ dùng icon bên dưới</p>`
            }
          </div>
        </div>

        <!-- EMOJI FALLBACK -->
        <div class="field" id="emoji-section" style="${existingImage ? 'opacity:0.4' : ''}">
          <label>Icon sản phẩm <span style="font-weight:400;color:var(--text-tertiary)">(dùng khi không có ảnh)</span></label>
          <div class="emoji-picker">
            ${EMOJIS.map(e => `
              <span class="emoji-opt ${(!existingImage && e === emoji) ? 'sel' : ''}"
                data-emoji="${e}"
                onclick="selectEmoji('${e}', ${isEdit ? product.id : 0})">
                ${e}
              </span>
            `).join('')}
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-green" style="flex:1;justify-content:center"
            onclick="${isEdit ? `saveEdit(${product.id})` : 'saveAdd()'}">
            ${isEdit ? '💾 Lưu thay đổi' : '➕ Thêm sản phẩm'}
          </button>
          <button class="btn btn-outline" onclick="closeModal()">Hủy</button>
        </div>
      </div>
    </div>
  `;
}
