from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    # Danh sách sản phẩm chi tiết
    products = [
        {"name": "Áo thun Disrupt", "price": "100.000", "image": "ao.jpg"},
        {"name": "Quần Jean", "price": "150.000", "image": "quan.jpg"},
        {"name": "Giày Sneaker", "price": "300.000", "image": "giay.jpg"}
    ]
    return render_template('index.html', products=products)

if __name__ == '__main__':
    app.run(debug=True)