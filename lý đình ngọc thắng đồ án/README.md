# 🛍️ Shop Thắng — Website Bán Hàng Python Flask

Đồ án môn học · Lý Đình Ngọc Thắng · Mã SV: 3025118657 · Lớp TH30.20

---

## Công nghệ sử dụng

- **Python** + **Flask** — Backend web framework
- **SQLite** — Cơ sở dữ liệu
- **Jinja2** — Template engine
- **Bootstrap 5** — Giao diện

---

## Cài đặt và chạy

### Bước 1: Cài Flask

```bash
pip install flask
```

Hoặc dùng requirements.txt:

```bash
pip install -r requirements.txt
```

### Bước 2: Chạy ứng dụng

```bash
python app.py
```

### Bước 3: Mở trình duyệt

```
http://127.0.0.1:5000
```

---

## Tài khoản mẫu

| Tài khoản | Mật khẩu  | Vai trò      |
|-----------|-----------|--------------|
| admin     | admin123  | Quản trị viên |
| user1     | user123   | Khách hàng   |
| user2     | user123   | Khách hàng   |

---

## Chức năng hệ thống

### Khách hàng
- Xem, tìm kiếm, lọc sản phẩm theo danh mục
- Xem chi tiết sản phẩm
- Đăng ký / Đăng nhập / Đăng xuất
- Quản lý giỏ hàng (thêm, cập nhật số lượng, xóa)
- **Công thức tính:** `tong_tien = so_luong × gia_san_pham`
- Đặt hàng với thông tin giao hàng + phương thức thanh toán
- Xem lịch sử đơn hàng và chi tiết từng đơn

### Quản trị viên (admin)
- Dashboard thống kê (sản phẩm, đơn hàng, khách hàng, doanh thu)
- CRUD sản phẩm: thêm, sửa, xóa
- Quản lý đơn hàng: xem danh sách, cập nhật trạng thái
- Quản lý khách hàng: xem danh sách

---

## Cấu trúc thư mục

```
shop_thang/
├── app.py                  # Ứng dụng Flask chính
├── shop.db                 # SQLite (tự tạo khi chạy)
├── requirements.txt
├── README.md
└── templates/
    ├── base.html           # Template gốc
    ├── index.html          # Trang chủ
    ├── login.html          # Đăng nhập
    ├── register.html       # Đăng ký
    ├── product_detail.html # Chi tiết sản phẩm
    ├── cart.html           # Giỏ hàng
    ├── checkout.html       # Đặt hàng
    ├── orders.html         # Lịch sử đơn hàng
    ├── order_detail.html   # Chi tiết đơn hàng
    └── admin/
        ├── base_admin.html # Template admin
        ├── dashboard.html  # Dashboard
        ├── products.html   # Quản lý sản phẩm
        ├── product_form.html
        ├── orders.html     # Quản lý đơn hàng
        └── users.html      # Quản lý khách hàng
```

---

## Cơ sở dữ liệu (SQLite)

| Bảng           | Mô tả                    |
|----------------|--------------------------|
| users          | Tài khoản người dùng     |
| products       | Sản phẩm                 |
| orders         | Đơn hàng                 |
| order_details  | Chi tiết đơn hàng        |

---

*Trường Đại học Kinh doanh và Công nghệ Hà Nội · Khoa CNTT · 2026*
