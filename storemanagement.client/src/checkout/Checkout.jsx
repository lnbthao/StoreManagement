import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toVNPrice } from "../util";
import "./checkout.css";

export default function Checkout() {
  const navTo = useNavigate();

  // LIST
  const [productList, setProductList] = useState([]);
  const [checkoutList, setCheckoutList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState("");

  // CUSTOMER
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerMsg, setCustomerMsg] = useState("");
  const [customer, setCustomer] = useState(null);
  const [phoneSearch, setPhoneSearch] = useState("");


  // PROMOTION
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [appliedPromotion, setAppliedPromotion] = useState(null);

  // PAYMENT
  const [paymentMethod, setPaymentMethod] = useState("cash");


  // -----------------------------------------------------------
  // LOAD DATA
  // -----------------------------------------------------------
  useEffect(() => {
    if (!loading) return;

    axios.get("/api/product").then((response) => {
      setProductList(response.data);
      setFilteredProducts(response.data);
    });

    axios.get("/api/category").then((category) =>
      setCategoryList(category.data)
    );

    document.title = "Trang thanh toán";
    setLoading(false);
  }, [loading]);


  // -----------------------------------------------------------
  // FILTER PRODUCTS BY CATEGORY
  // -----------------------------------------------------------
  const getProductByCategoryName = (categoryName) => {
    setActiveCategory(categoryName);

    if (categoryName === "Tất cả") {
      setFilteredProducts(productList);
    } else {
      setFilteredProducts(
        productList.filter((p) => p.category.categoryName === categoryName)
      );
    }
  };


  // -----------------------------------------------------------
  // SEARCH PRODUCT
  // -----------------------------------------------------------
  function handleSearch(value) {
    setSearchText(value);
    const keyword = value.trim().toLowerCase();

    if (!keyword) {
      setFilteredProducts(productList);
      return;
    }

    const filtered = productList.filter(
      (p) =>
        p.productName.toLowerCase().includes(keyword) ||
        p.barcode.toLowerCase().includes(keyword)
    );

    setFilteredProducts(filtered);
  }


  // -----------------------------------------------------------
  // ADD PRODUCT TO CART
  // -----------------------------------------------------------
  function handleAddToCart(product) {
    const existQty = getCartQuantity(product.productId);

    if (existQty >= product.totalQuantity) {
      alert(`Sản phẩm '${product.productName}' đã đạt số lượng tối đa trong kho!`);
      return;
    }

    const exist = checkoutList.find(item => item.productId === product.productId);

    if (exist) {
      setCheckoutList((prev) =>
        prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCheckoutList((prev) => [
        ...prev,
        {
          productId: product.productId,
          productName: product.productName,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  }

  function getCartQuantity(productId) {
    const item = checkoutList.find(i => i.productId === productId);
    return item ? item.quantity : 0;
  }



  // -----------------------------------------------------------
  // UPDATE CART
  // -----------------------------------------------------------
  function handleIncrease(id) {
    const product = productList.find(p => p.productId === id);
    const currentQty = getCartQuantity(id);

    if (product && currentQty >= product.totalQuantity) {
      alert(`Sản phẩm '${product.productName}' đã đạt số lượng tồn tối đa!`);
      return;
    }

    setCheckoutList((prev) =>
      prev.map((item) =>
        item.productId === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }


  function handleDecrease(id) {
    setCheckoutList((prev) =>
      prev
        .map((item) =>
          item.productId === id
            ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
            : item
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function handleRemove(id) {
    setCheckoutList((prev) => prev.filter((i) => i.productId !== id));
  }


  // -----------------------------------------------------------
  // CUSTOMER SEARCH API
  // -----------------------------------------------------------
  async function searchCustomerByPhone() {
    const phone = customerPhone.trim();

    if (!phone) {
      setCustomer(null);
      setCustomerMsg("Vui lòng nhập số điện thoại.");
      return;
    }

    try {
      const res = await axios.get(`/api/customer/search`, {
        params: { phone }
      });

      setCustomer(res.data);

      if (res.data.isGuest) {
        setCustomerMsg("Khách vãng lai");
      } else {
        setCustomerMsg("Đã tìm thấy khách hàng.");
        console.log("Khach hang: " + customer);
      }
    } catch (error) {
      console.error(error);
      setCustomer(null);
      setCustomerMsg("Không thể tìm khách hàng.");
    }
  }



  // -----------------------------------------------------------
  // APPLY PROMOTION
  // -----------------------------------------------------------
  async function handleApplyPromo() {
    const code = promoCode.trim();
    if (!code) {
      setPromoMessage("Vui lòng nhập mã khuyến mãi");
      return;
    }

    const subtotal = checkoutList.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      const res = await axios.get(`/api/promotion/code/${code}`, {
        params: { orderAmount: subtotal },
      });

      const data = res.data;

      // nếu mã sai hoặc có thông báo từ server
      if (data.message && data.message !== "") {
        setPromoMessage(data.message);
        setDiscountValue(0);
        setAppliedPromotion(null);
        return;
      }

      let discount = 0;
      if (data.discountType === "percent") {
        discount = (subtotal * data.discountValue) / 100;
      } else if (data.discountType === "fixed") {
        discount = data.discountValue;
      }
      discount = Math.min(discount, subtotal);

      setDiscountValue(discount);
      setAppliedPromotion(data);

      setPromoMessage("Áp dụng mã khuyến mãi thành công!");
    } catch (error) {
      setPromoMessage("Không thể áp dụng mã khuyến mãi.");
      setAppliedPromotion(null);
      setDiscountValue(0);
    }
    console.log("Applied Promotion: ", appliedPromotion);
  }


  // -----------------------------------------------------------
  // AUTO UPDATE DISCOUNT WHEN CART CHANGES
  // -----------------------------------------------------------
  useEffect(() => {
    if (!appliedPromotion) return;

    const subtotal = checkoutList.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (subtotal <= 0) {
      setDiscountValue(0);
      return;
    }

    let discount = 0;
    if (appliedPromotion.discountType === "percent") {
      discount = (subtotal * appliedPromotion.discountValue) / 100;
    } else {
      discount = appliedPromotion.discountValue;
    }

    discount = Math.min(discount, subtotal);
    setDiscountValue(discount);
  }, [checkoutList]);


  // -----------------------------------------------------------
  // TOTALS
  // -----------------------------------------------------------
  const subtotal = checkoutList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const total = subtotal - discountValue;

  // -----------------------------------------------------------
  // PAYMENT WITH CASH
  // -----------------------------------------------------------
  async function handleCashPayment() {
    if (checkoutList.length === 0) {
      alert("Giỏ hàng đang trống!");
      return;
    }

    if (!customer) {
      alert("Vui lòng chọn hoặc tìm khách hàng trước khi thanh toán!");
      return;
    }

    try {
      const payload = {
        customerId: customer.customerId || null,
        items: checkoutList.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        promotionId: appliedPromotion ? appliedPromotion.promoId : null,
        discountValue: discountValue,
        totalAmount: total
      };

      console.log("Payload thanh toán tiền mặt: ", payload);

      const res = await axios.post("/api/payment/cash", payload);

      alert("Thanh toán tiền mặt thành công!");

      // Reset giỏ hàng sau thanh toán
      setCheckoutList([]);
      setCustomer(null);
      setPromoCode("");
      setAppliedPromotion(null);
      setDiscountValue(0);
      setCustomerPhone("");
      setPromoMessage("");

      axios.get("/api/product").then((response) => {
        setProductList(response.data);
        setFilteredProducts(response.data);
      });
      // Điều hướng sang trang hóa đơn nếu muốn
      // navTo(`/order/${res.data.orderId}`);

    } catch (err) {
      console.error(err);
      alert("Thanh toán thất bại! " + err.response?.data?.message || "");
    }
  }



  // -----------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------
  return loading ? (
    <></>
  ) : (
    <>
      <div id="container">
        {/* LEFT PANEL */}
        <div id="left">
          <h1 className="fw-bold h3">Tất cả sản phẩm</h1>

          {/* SEARCH PRODUCT */}
          <div className="input-group mb-2">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              className="form-control"
              placeholder="Nhập barcode hoặc tên sản phẩm"
              type="search"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* CATEGORY FILTER */}
          <div className="btn-group overflow-y-auto my-2">
            <button
              className={`btn ${activeCategory === "Tất cả"
                ? "btn-secondary"
                : "btn-outline-secondary"
                }`}
              onClick={() => getProductByCategoryName("Tất cả")}
            >
              Tất cả
            </button>

            {categoryList.map((c) => (
              <button
                key={`cat-${c.categoryId}`}
                className={`btn ${activeCategory === c.categoryName
                  ? "btn-secondary"
                  : "btn-outline-secondary"
                  }`}
                onClick={() => getProductByCategoryName(c.categoryName)}
              >
                {c.categoryName}
              </button>
            ))}
          </div>

          {/* PRODUCT LIST */}
          <div id="product-list">
            {filteredProducts.map((p) => (
              <button
                key={p.barcode}
                className="product-box"
                onClick={() => handleAddToCart(p)}
                disabled={getCartQuantity(p.productId) >= p.totalQuantity}
                style={{
                  opacity: getCartQuantity(p.productId) >= p.totalQuantity ? 0.5 : 1,
                  cursor: getCartQuantity(p.productId) >= p.totalQuantity ? "not-allowed" : "pointer"
                }}
              >

                <img
                  src={`/images/product_img/${p.productId}.png`}
                  alt={p.productName}
                  className="product-preview"
                  onError={(e) =>
                    (e.target.src = "/images/product_img/err.png")
                  }
                />
                <p className="my-2 h5 fw-normal">{p.productName}</p>
                <i className="fw-bold my-1 d-block">{toVNPrice(p.price)}</i>
                <p className="mb-0">Tồn kho: {p.totalQuantity}</p>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div id="right">
          <h1 className="fw-bold h3">Đơn hàng hiện tại</h1>

          {/* CUSTOMER SEARCH */}
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-phone"></i>
            </span>

            <input
              className="form-control"
              placeholder="Nhập số điện thoại của khách hàng"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchCustomerByPhone();
                }
              }}
            />
            <button className="btn btn-primary" onClick={searchCustomerByPhone}>
              Tìm
            </button>
          </div>


          {customer && (
            <div className="mt-3 p-2 mb-3 border rounded bg-light">
              <div>
                <strong>Khách hàng:</strong> {customer.customerName}
              </div>
              {customer.phone && (
                <div>
                  <strong>SĐT:</strong> {customer.phone}
                </div>
              )}
              {customer.address && (
                <div>
                  <strong>Địa chỉ:</strong> {customer.address}
                </div>
              )}
            </div>
          )}

          {/* {customerMsg && <p className="mt-3 text-primary">{customerMsg}</p>} */}


          {/* CART LIST */}
          <div id="checkout-list">
            {checkoutList.length === 0 ? (
              <p className="text-muted fst-italic">Chưa có sản phẩm nào</p>
            ) : (
              checkoutList.map((item) => (
                <div
                  key={item.productId}
                  className="d-flex gap-1 align-items-start my-2 flex-grow-1"
                >
                  <img
                    src={`/images/product_img/${item.productId}.png`}
                    alt={item.productName}
                    className="product-preview"
                    onError={(e) =>
                      (e.target.src = "/images/product_img/err.png")
                    }
                  />

                  <div className="flex-grow-1">
                    <p className="my-2 h5 fw-normal">{item.productName}</p>
                    <div className="d-flex align-items-center">
                      <p className="fw-bold flex-grow-1 m-0 fst-italic">
                        {toVNPrice(item.price * item.quantity)}
                      </p>

                      {/* QUANTITY CONTROL */}
                      <div className="input-group ms-4 w-auto">
                        <button
                          className="btn btn-primary rounded-start-circle"
                          onClick={() => handleDecrease(item.productId)}
                        >
                          &minus;
                        </button>

                        <input
                          className="quantity-readonly-input"
                          value={item.quantity}
                          readOnly
                          type="number"
                        />

                        <button
                          className="btn btn-primary rounded-end-circle"
                          onClick={() => handleIncrease(item.productId)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* REMOVE */}
                  <button
                    className="btn p-0 border-0 my-2"
                    onClick={() => handleRemove(item.productId)}
                  >
                    <i className="bi bi-x-lg h4"></i>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* PROMOTION */}
          <div className="input-group mt-2">
            <input
              className="form-control"
              placeholder="Nhập mã khuyến mãi"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleApplyPromo}>
              Áp dụng
            </button>
          </div>

          {promoMessage && (
            <p
              className={`mt-2 ${appliedPromotion ? "text-success" : "text-danger"
                }`}
            >
              {promoMessage}
            </p>
          )}

          {appliedPromotion && (
            <button
              className="btn btn-outline-danger mt-1 w-100"
              onClick={() => {
                setAppliedPromotion(null);
                setDiscountValue(0);
                setPromoMessage("Đã xóa mã khuyến mãi.");
                setPromoCode("");
              }}
            >
              Xóa mã khuyến mãi
            </button>
          )}

          {/* TOTAL */}
          <table className="my-2 bg-white w-100">
            <tbody className="border-bottom border-secondary-subtle">
              <tr>
                <td className="p-2">Tổng phụ</td>
                <td className="p-2 text-end">{toVNPrice(subtotal)}</td>
              </tr>
              <tr>
                <td className="p-2">Khuyến mãi</td>
                <td className="p-2 text-end">-{toVNPrice(discountValue)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th className="p-2">Tổng cộng</th>
                <th className="p-2 text-end">{toVNPrice(total)}</th>
              </tr>
            </tfoot>
          </table>

          {/* PAYMENT METHOD */}
          {/* <div className="mt-3 mb-2 border p-3 rounded">
            <h5 className="fw-semibold mb-2">Chọn phương thức thanh toán:</h5>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="pay-cash"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <label className="form-check-label" htmlFor="pay-cash">
                Thanh toán tiền mặt
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="pay-vnpay"
                name="payment"
                value="vnpay"
                checked={paymentMethod === "vnpay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <label className="form-check-label" htmlFor="pay-vnpay">
                Thanh toán qua VNPAY
              </label>
            </div>
          </div> */}

          {/* PAY BUTTON */}
          <button
            className="btn btn-primary w-100"
            onClick={() => {
              // if (paymentMethod === "cash") {
              handleCashPayment();
              // } else {
              //   alert("VNPAY bạn đã có API rồi, hãy gọi API VNPAY ở đây.");
              // }
            }}
          >
            <i className="bi bi-cart-fill"></i> Thanh toán bằng tiền mặt
          </button>

        </div>
      </div>
    </>
  );
}
