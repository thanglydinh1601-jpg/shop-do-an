from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import sqlite3
import os
from functools import wraps
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'shopthang_secret_key_2026'

DB_PATH = 'shop.db'

# ─── Database ───────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            fullname TEXT NOT NULL,
            email TEXT,
            role TEXT DEFAULT 'customer',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL,
            stock INTEGER DEFAULT 0,
            icon TEXT DEFAULT '📦',
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            fullname TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            payment TEXT DEFAULT 'COD',
            total INTEGER NOT NULL,
            status TEXT DEFAULT 'Chờ xác nhận',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS order_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price INTEGER NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
    ''')

    # Seed data nếu chưa có
    if not c.execute('SELECT 1 FROM users LIMIT 1').fetchone():
        c.executemany('INSERT INTO users (username,password,fullname,email,role) VALUES (?,?,?,?,?)', [
            ('admin',    'admin123', 'Lý Đình Thắng',    'admin@shop.vn',   'admin'),
            ('user1',    'user123',  'Nguyễn Văn An',    'an@gmail.com',    'customer'),
            ('user2',    'user123',  'Trần Thị Bình',    'binh@gmail.com',  'customer'),
        ])

    if not c.execute('SELECT 1 FROM products LIMIT 1').fetchone():
        c.executemany('INSERT INTO products (name,category,price,stock,icon) VALUES (?,?,?,?,?)', [
            ('Laptop Dell XPS',      'Điện tử',   22500000, 15, '💻'),
            ('iPhone 15 Pro',        'Điện tử',   28900000,  8, '📱'),
            ('Tai nghe Sony',        'Điện tử',    3200000, 30, '🎧'),
            ('Áo Polo Nam',          'Thời trang',  350000, 50, '👔'),
            ('Túi xách nữ',          'Thời trang',  890000, 25, '👜'),
            ('Nồi cơm điện',         'Gia dụng',   1200000, 20, '🍳'),
            ('Mì ramen Hàn',         'Thực phẩm',    45000,200, '🍜'),
            ('Cà phê Highlands',     'Thực phẩm',    65000,100, '☕'),
            ('Python cho người mới', 'Sách',        120000, 40, '📚'),
            ('Máy ảnh Canon',        'Điện tử',   15000000,  5, '📷'),
        ])

    conn.commit()
    conn.close()

# ─── Decorators ─────────────────────────────────────────────
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            flash('Vui lòng đăng nhập!', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('role') != 'admin':
            flash('Bạn không có quyền truy cập!', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated

def fmt_price(value):
    return f"{value:,}đ".replace(',', '.')
app.jinja_env.filters['fmt_price'] = fmt_price

# ─── Auth ────────────────────────────────────────────────────
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password']
        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE username=? AND password=?',
                            (username, password)).fetchone()
        conn.close()
        if user:
            session['user_id']  = user['id']
            session['username'] = user['username']
            session['fullname'] = user['fullname']
            session['role']     = user['role']
            session['cart']     = session.get('cart', {})
            flash(f'Chào mừng {user["fullname"]}!', 'success')
            return redirect(url_for('index'))
        flash('Tên đăng nhập hoặc mật khẩu không đúng!', 'danger')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password']
        fullname = request.form['fullname'].strip()
        email    = request.form.get('email','').strip()
        if not username or not password or not fullname:
            flash('Vui lòng nhập đầy đủ thông tin!', 'danger')
            return render_template('register.html')
        conn = get_db()
        try:
            conn.execute('INSERT INTO users (username,password,fullname,email) VALUES (?,?,?,?)',
                         (username, password, fullname, email))
            conn.commit()
            flash('Đăng ký thành công! Vui lòng đăng nhập.', 'success')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('Tên đăng nhập đã tồn tại!', 'danger')
        finally:
            conn.close()
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Đã đăng xuất!', 'info')
    return redirect(url_for('login'))

# ─── Shop ────────────────────────────────────────────────────
@app.route('/')
def index():
    conn = get_db()
    category = request.args.get('cat', '')
    search   = request.args.get('q', '')
    query    = 'SELECT * FROM products WHERE 1=1'
    params   = []
    if category:
        query += ' AND category=?'; params.append(category)
    if search:
        query += ' AND name LIKE ?'; params.append(f'%{search}%')
    products   = conn.execute(query, params).fetchall()
    categories = conn.execute('SELECT DISTINCT category FROM products').fetchall()
    conn.close()
    cart_count = sum(session.get('cart', {}).values())
    return render_template('index.html', products=products, categories=categories,
                           selected_cat=category, search=search, cart_count=cart_count)

@app.route('/product/<int:pid>')
def product_detail(pid):
    conn = get_db()
    product = conn.execute('SELECT * FROM products WHERE id=?', (pid,)).fetchone()
    conn.close()
    if not product:
        flash('Sản phẩm không tồn tại!', 'danger')
        return redirect(url_for('index'))
    cart_count = sum(session.get('cart', {}).values())
    return render_template('product_detail.html', product=product, cart_count=cart_count)

# ─── Cart ────────────────────────────────────────────────────
@app.route('/cart')
@login_required
def cart():
    cart_data = session.get('cart', {})
    conn = get_db()
    items = []
    total = 0
    for pid, qty in cart_data.items():
        p = conn.execute('SELECT * FROM products WHERE id=?', (int(pid),)).fetchone()
        if p:
            subtotal = p['price'] * qty
            total += subtotal
            items.append({'product': p, 'qty': qty, 'subtotal': subtotal})
    conn.close()
    return render_template('cart.html', items=items, total=total,
                           cart_count=len(cart_data))

@app.route('/cart/add/<int:pid>', methods=['POST'])
@login_required
def add_to_cart(pid):
    qty = int(request.form.get('qty', 1))
    conn = get_db()
    p = conn.execute('SELECT * FROM products WHERE id=?', (pid,)).fetchone()
    conn.close()
    if not p or p['stock'] <= 0:
        flash('Sản phẩm hết hàng!', 'danger')
        return redirect(request.referrer or url_for('index'))
    cart = session.get('cart', {})
    key  = str(pid)
    cart[key] = min(cart.get(key, 0) + qty, p['stock'])
    session['cart'] = cart
    flash(f'Đã thêm "{p["name"]}" vào giỏ hàng!', 'success')
    return redirect(request.referrer or url_for('index'))

@app.route('/cart/update/<int:pid>', methods=['POST'])
@login_required
def update_cart(pid):
    qty  = int(request.form.get('qty', 1))
    cart = session.get('cart', {})
    key  = str(pid)
    if qty <= 0:
        cart.pop(key, None)
    else:
        cart[key] = qty
    session['cart'] = cart
    return redirect(url_for('cart'))

@app.route('/cart/remove/<int:pid>')
@login_required
def remove_from_cart(pid):
    cart = session.get('cart', {})
    cart.pop(str(pid), None)
    session['cart'] = cart
    flash('Đã xóa sản phẩm khỏi giỏ hàng!', 'info')
    return redirect(url_for('cart'))

# ─── Orders ──────────────────────────────────────────────────
@app.route('/checkout', methods=['GET', 'POST'])
@login_required
def checkout():
    cart_data = session.get('cart', {})
    if not cart_data:
        flash('Giỏ hàng trống!', 'warning')
        return redirect(url_for('cart'))

    conn = get_db()
    if request.method == 'POST':
        fullname = request.form['fullname'].strip()
        phone    = request.form['phone'].strip()
        address  = request.form['address'].strip()
        payment  = request.form.get('payment', 'COD')

        if not fullname or not phone or not address:
            flash('Vui lòng nhập đầy đủ thông tin giao hàng!', 'danger')
            return redirect(url_for('checkout'))

        total = 0
        items = []
        for pid, qty in cart_data.items():
            p = conn.execute('SELECT * FROM products WHERE id=?', (int(pid),)).fetchone()
            if p:
                total += p['price'] * qty
                items.append({'id': p['id'], 'name': p['name'], 'price': p['price'], 'qty': qty})

        cur = conn.cursor()
        cur.execute('''INSERT INTO orders (user_id,fullname,phone,address,payment,total)
                       VALUES (?,?,?,?,?,?)''',
                    (session['user_id'], fullname, phone, address, payment, total))
        order_id = cur.lastrowid
        for item in items:
            cur.execute('''INSERT INTO order_details (order_id,product_id,product_name,quantity,price)
                           VALUES (?,?,?,?,?)''',
                        (order_id, item['id'], item['name'], item['qty'], item['price']))
            cur.execute('UPDATE products SET stock=stock-? WHERE id=?', (item['qty'], item['id']))

        conn.commit()
        conn.close()
        session['cart'] = {}
        flash(f'Đặt hàng thành công! Mã đơn: #{order_id}', 'success')
        return redirect(url_for('my_orders'))

    items = []
    total = 0
    for pid, qty in cart_data.items():
        p = conn.execute('SELECT * FROM products WHERE id=?', (int(pid),)).fetchone()
        if p:
            subtotal = p['price'] * qty
            total += subtotal
            items.append({'product': p, 'qty': qty, 'subtotal': subtotal})
    conn.close()
    return render_template('checkout.html', items=items, total=total,
                           cart_count=len(cart_data))

@app.route('/orders')
@login_required
def my_orders():
    conn = get_db()
    orders = conn.execute('''SELECT o.*, COUNT(od.id) as item_count
                             FROM orders o
                             LEFT JOIN order_details od ON o.id=od.order_id
                             WHERE o.user_id=?
                             GROUP BY o.id ORDER BY o.created_at DESC''',
                          (session['user_id'],)).fetchall()
    conn.close()
    cart_count = sum(session.get('cart', {}).values())
    return render_template('orders.html', orders=orders, cart_count=cart_count)

@app.route('/orders/<int:oid>')
@login_required
def order_detail(oid):
    conn = get_db()
    order   = conn.execute('SELECT * FROM orders WHERE id=? AND user_id=?',
                           (oid, session['user_id'])).fetchone()
    if not order and session.get('role') == 'admin':
        order = conn.execute('SELECT * FROM orders WHERE id=?', (oid,)).fetchone()
    if not order:
        flash('Không tìm thấy đơn hàng!', 'danger')
        return redirect(url_for('my_orders'))
    details = conn.execute('SELECT * FROM order_details WHERE order_id=?', (oid,)).fetchall()
    conn.close()
    cart_count = sum(session.get('cart', {}).values())
    return render_template('order_detail.html', order=order, details=details,
                           cart_count=cart_count)

# ─── Admin ───────────────────────────────────────────────────
@app.route('/admin')
@login_required
@admin_required
def admin_dashboard():
    conn = get_db()
    stats = {
        'products': conn.execute('SELECT COUNT(*) FROM products').fetchone()[0],
        'orders':   conn.execute('SELECT COUNT(*) FROM orders').fetchone()[0],
        'users':    conn.execute('SELECT COUNT(*) FROM users').fetchone()[0],
        'revenue':  conn.execute("SELECT COALESCE(SUM(total),0) FROM orders WHERE status='Đã giao'").fetchone()[0],
    }
    recent_orders = conn.execute('''SELECT o.*, u.fullname as customer
                                    FROM orders o JOIN users u ON o.user_id=u.id
                                    ORDER BY o.created_at DESC LIMIT 5''').fetchall()
    conn.close()
    return render_template('admin/dashboard.html', stats=stats, recent_orders=recent_orders)

@app.route('/admin/products')
@login_required
@admin_required
def admin_products():
    conn = get_db()
    products = conn.execute('SELECT * FROM products ORDER BY id DESC').fetchall()
    conn.close()
    return render_template('admin/products.html', products=products)

@app.route('/admin/products/add', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_add_product():
    if request.method == 'POST':
        name     = request.form['name'].strip()
        category = request.form['category']
        price    = int(request.form['price'])
        stock    = int(request.form['stock'])
        icon     = request.form.get('icon', '📦') or '📦'
        desc     = request.form.get('description', '')
        if not name or not price:
            flash('Vui lòng nhập đầy đủ thông tin!', 'danger')
            return render_template('admin/product_form.html', product=None)
        conn = get_db()
        conn.execute('INSERT INTO products (name,category,price,stock,icon,description) VALUES (?,?,?,?,?,?)',
                     (name, category, price, stock, icon, desc))
        conn.commit()
        conn.close()
        flash('Đã thêm sản phẩm!', 'success')
        return redirect(url_for('admin_products'))
    return render_template('admin/product_form.html', product=None)

@app.route('/admin/products/edit/<int:pid>', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_edit_product(pid):
    conn = get_db()
    product = conn.execute('SELECT * FROM products WHERE id=?', (pid,)).fetchone()
    if not product:
        flash('Sản phẩm không tồn tại!', 'danger')
        return redirect(url_for('admin_products'))
    if request.method == 'POST':
        name     = request.form['name'].strip()
        category = request.form['category']
        price    = int(request.form['price'])
        stock    = int(request.form['stock'])
        icon     = request.form.get('icon', '📦') or '📦'
        desc     = request.form.get('description', '')
        conn.execute('UPDATE products SET name=?,category=?,price=?,stock=?,icon=?,description=? WHERE id=?',
                     (name, category, price, stock, icon, desc, pid))
        conn.commit()
        conn.close()
        flash('Đã cập nhật sản phẩm!', 'success')
        return redirect(url_for('admin_products'))
    conn.close()
    return render_template('admin/product_form.html', product=product)

@app.route('/admin/products/delete/<int:pid>')
@login_required
@admin_required
def admin_delete_product(pid):
    conn = get_db()
    conn.execute('DELETE FROM products WHERE id=?', (pid,))
    conn.commit()
    conn.close()
    flash('Đã xóa sản phẩm!', 'success')
    return redirect(url_for('admin_products'))

@app.route('/admin/orders')
@login_required
@admin_required
def admin_orders():
    conn = get_db()
    orders = conn.execute('''SELECT o.*, u.fullname as customer
                             FROM orders o JOIN users u ON o.user_id=u.id
                             ORDER BY o.created_at DESC''').fetchall()
    conn.close()
    return render_template('admin/orders.html', orders=orders)

@app.route('/admin/orders/status/<int:oid>', methods=['POST'])
@login_required
@admin_required
def admin_update_order(oid):
    status = request.form['status']
    conn = get_db()
    conn.execute('UPDATE orders SET status=? WHERE id=?', (status, oid))
    conn.commit()
    conn.close()
    flash(f'Cập nhật trạng thái đơn #{oid} thành công!', 'success')
    return redirect(url_for('admin_orders'))

@app.route('/admin/users')
@login_required
@admin_required
def admin_users():
    conn = get_db()
    users = conn.execute('''SELECT u.*, COUNT(o.id) as order_count
                            FROM users u LEFT JOIN orders o ON u.id=o.user_id
                            GROUP BY u.id ORDER BY u.id''').fetchall()
    conn.close()
    return render_template('admin/users.html', users=users)

if __name__ == '__main__':
    init_db()
    print("✅ Shop Thắng đang chạy tại http://127.0.0.1:5000")
    app.run(debug=True)
