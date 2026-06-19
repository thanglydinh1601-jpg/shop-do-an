products = []

while True:
    print("\n1. Thêm sản phẩm")
    print("2. Xem sản phẩm")
    print("3. Thoát")

    choice = input("Chọn: ")

    if choice == "1":
        name = input("Tên sản phẩm: ")
        price = input("Giá: ")
        products.append({"name": name, "price": price})

    elif choice == "2":
        for p in products:
            print(p["name"], "-", p["price"])

    elif choice == "3":
        break