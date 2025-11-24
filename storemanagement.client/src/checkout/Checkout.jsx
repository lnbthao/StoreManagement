import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { backendUrl, toVNPrice } from "../util";
import { useNavigate } from "react-router-dom";
import "./checkout.css";
import PaymentModal from "../components/order/PaymentModal";

export default function Checkout() {
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("currentUser");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  };
  
  const navTo = useNavigate();
  const currentUser = getCurrentUser();

  // LIST
  const [productList, setProductList] = useState([]);
  const [checkoutList, setCheckoutList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [promotionList, setPromotionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState(-1);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState("");

  // CUSTOMER
  const [customerPhone, setCustomerPhone] = useState("");
  const [customer, setCustomer] = useState(null);
  const [customerMessage, setCustomerMessage] = useState("");

  // PROMOTION
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [appliedPromotion, setAppliedPromotion] = useState(null);

  // Payment method selection
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const checkoutListRef = useRef(null);

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

    axios.get("/api/promotion").then(promotion =>
      setPromotionList(promotion.data)
    );

    document.title = "Trang thanh toán";
    setLoading(false);
  }, [loading]);

  useEffect(() => {
    try {
      checkoutListRef.current.scrollTo(0, checkoutListRef.current.scrollHeight);
    }
    catch { }
  }, [checkoutList])


  // -----------------------------------------------------------
  // FILTER PRODUCTS BY CATEGORY
  // -----------------------------------------------------------
  const getProductByCategoryId = (categoryId) => {
    setActiveCategory(categoryId);
    
    if (categoryId == -1) setFilteredProducts(productList);
    else axios.get(`/api/product/category/${categoryId}`).then(res => setFilteredProducts(res.data));
  };


  // -----------------------------------------------------------
  // SEARCH PRODUCT
  // -----------------------------------------------------------
  function handleSearch(value) {
    setSearchText(value);
    const keyword = value.trim().toLowerCase();
    axios.get(`/api/product?search=${keyword}`)
      .then(response => setFilteredProducts(response.data));
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
          imageUrl: product.imageUrl
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
  function checkPhone(val) {
    let msg = "";
    if (!val.trim()) msg = "Vui lòng nhập số điện thoại."
    else if (!/^\d{10,11}$/.test(val)) msg = "SĐT chỉ chứa số (10–11 chữ số).";

    setCustomerMessage(msg);

    return (msg) ? false : true;
  }

  async function searchCustomerByPhone(val) {
    setCustomerPhone(val);

    if (!checkPhone(val)) {
      setCustomer(null);
      return;
    }

    try {
      const res = await axios.get(`/api/customer/phone/${val}`);
      const customer = res.data;
      setCustomer(customer);
    } catch (error) {
      console.error(error);
      setCustomer(null);
      setCustomerMessage("Không thể tìm khách hàng.");
    }
  }

  // -----------------------------------------------------------
  // APPLY PROMOTION
  // -----------------------------------------------------------
  async function handleApplyPromo(code) {
    setPromoCode(code);
    
    const subtotal = checkoutList.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (code === "") {
      setAppliedPromotion(null);
      setDiscountValue(0);
      setPromoMessage("");
      return;
    }
    
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
      setPromoMessage("");
    } catch (error) {
      setPromoMessage("Không thể áp dụng mã khuyến mãi.");
      setAppliedPromotion(null);
      setDiscountValue(0);
    }
  }


  // -----------------------------------------------------------
  // AUTO UPDATE DISCOUNT WHEN CART CHANGES
  // -----------------------------------------------------------
  useEffect(() => {
    handleApplyPromo(promoCode);
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
  const handleSubmit = async () => {
    if (!checkPhone(customerPhone)) return;

    if (checkoutList.length === 0) {
      alert("Giỏ hàng đang trống!");
      return;
    }

    setShowPaymentModal(true);
  }

  const handleOrderSubmit = async (paymentMethod) => {
    setShowPaymentModal(false);
    setSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        customerId: customer.customerId,
        userId: parseInt(currentUser.userId),
        promoId: appliedPromotion ? appliedPromotion.promoId : null,
        orderDate: new Date().toISOString(),
        status: "pending",
        totalAmount: total,
        discountAmount: discountValue,
        orderItems: checkoutList.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
      };

      console.log("Dữ liệu đơn hàng chuẩn bị gửi:", orderData);
      console.log("Phương thức thanh toán:", paymentMethod);

      // Call API to create order
      const response = await axios.post("/api/order", orderData);
      const createdOrderId = response.data?.orderId;
      
      if (paymentMethod === "cash") {
        // Gọi API cập nhật status thành "paid" cho thanh toán tiền mặt
        try {
          await axios.put(`/api/order/${createdOrderId}/status`, { status: "paid" });
          alert("Tạo đơn hàng và thanh toán tiền mặt thành công!");
        } catch (statusError) {
          console.error("Lỗi cập nhật status:", statusError);
          alert("Tạo đơn hàng thành công nhưng không thể cập nhật trạng thái thanh toán!");
        }
        navTo(0);
      } else if (paymentMethod === "online") {
        // Gửi POST form để trình duyệt follow Redirect từ backend (không dùng axios)
        try {
          const fields = {
            OrderId: (response.data?.orderId ?? Date.now()).toString(),
            Amount: Math.round(total).toString(),
            FullName: customer?.customerName || currentUser?.fullName || "Khách hàng",
            OrderInfo: `Thanh toán đơn hàng #${response.data?.orderId || Date.now()}`
          };    
          // Tạo form và submit để chuyển trang
          const form = document.createElement("form");
          form.method = "POST";
          form.action = "/api/payment/CreatePaymentMomo";
          form.acceptCharset = "UTF-8";
          Object.entries(fields).forEach(([name, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = String(value ?? "");
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
          // Không đặt navTo sau submit vì trình duyệt sẽ chuyển trang
        } catch (momoError) {
          console.error("Lỗi khi submit form MoMo:", momoError);
          alert("Lỗi thanh toán MoMo: " + (momoError.response?.data?.message || momoError.message));
          navTo(0);
        }
      }
    } catch (error) {
      console.error("Error creating order:", error);
      console.error("Error response:", error.response?.data);
      console.error("Order data sent:", orderData);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          "Không thể tạo đơn hàng. Vui lòng thử lại!";
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  }

  // -----------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3">Đang tải form thanh toán...</p>
      </div>
    );
  }

  return (
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
              className={`btn ${activeCategory === -1
                ? "btn-secondary"
                : "btn-outline-secondary"
                }`}
              onClick={() => getProductByCategoryId(-1)}
            >
              Tất cả
            </button>

            {categoryList.map((c) => (
              <button
                key={`cat-${c.categoryId}`}
                className={`btn ${activeCategory === c.categoryId
                  ? "btn-secondary"
                  : "btn-outline-secondary"
                  }`}
                onClick={() => getProductByCategoryId(c.categoryId)}
              >
                {c.categoryName}
              </button>
            ))}
          </div>

          {/* PRODUCT LIST */}
          {
            filteredProducts.length === 0 ? <p className="text-muted text-center">Không có sản phẩm cần tìm</p> :            
            <div id="product-list">
            {
              filteredProducts.map((p) => (
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
                    src={`${backendUrl}${p.imageUrl}`}
                    onError={e => e.target.src = `${backendUrl}/images/products/error.png`}
                    alt={p.productName}
                    className="product-preview"
                  />
                  <p className="my-2 h5 fw-normal">{p.productName}</p>
                  <i className="fw-bold my-1 d-block">{toVNPrice(p.price)}</i>
                  <p className="mb-0">Tồn kho: {p.quantity}</p>
                </button>
              ))
            }
            </div>
          }
        </div>

        {/* RIGHT PANEL */}
        <form id="right" onSubmit={e => e.preventDefault()}>
          <h1 className="fw-bold h3">Đơn hàng hiện tại</h1>

          {/* CUSTOMER SEARCH */}
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-phone"></i>
            </span>

            <input            
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="form-control"
              placeholder="Nhập số điện thoại của khách hàng"
              value={customerPhone}
              onChange={e => searchCustomerByPhone(e.target.value)}
              required
            />
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

          {customerMessage && <p className="mt-3 text-danger">{customerMessage}</p>}

          {/* CART LIST */}
          <div className="checkout-list" ref={checkoutListRef}>
            {checkoutList.length === 0 ? (
              <p className="text-muted fst-italic text-center mt-2">Chưa có sản phẩm nào!</p>
            ) : (
              checkoutList.map((item) => (
                <div
                  key={item.productId}
                  className="d-flex gap-1 align-items-start my-2 flex-grow-1"
                >
                  <img
                    src={`${backendUrl}${item.imageUrl}`}
                    onError={e => e.target.src = `${backendUrl}/images/products/error.png`}
                    alt={item.productName}
                    className="product-preview"
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
          <div className="mt-2">
            <label>Chọn mã khuyến mãi:</label>
            <select
              className="form-control"
              value={promoCode}
              onChange={e => handleApplyPromo(e.target.value)}
            >
              <option value="">Không áp dụng khuyến mãi</option>
              {
                promotionList.map(pro =>
                  <option key={pro.promoCode} value={pro.promoCode}>{pro.promoCode}</option>
                )
              }
            </select>
          </div>

          {promoMessage && <p className="mt-2 text-danger">{promoMessage}</p>}

          {/* TOTAL */}
          <table className="my-2 bg-white w-100">
            <tbody className="border-bottom border-secondary-subtle">
              <tr>
                <td className="p-2">Tạm thu:</td>
                <td className="p-2 text-end">{toVNPrice(subtotal)}</td>
              </tr>
              <tr>
                <td className="p-2">Khuyến mãi:</td>
                <td className="p-2 text-end">-{toVNPrice(discountValue)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th className="p-2">Tổng cộng:</th>
                <th className="p-2 text-end">{toVNPrice(total)}</th>
              </tr>
            </tfoot>
          </table>
          
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitting}
            onClick={() => handleSubmit()}
          >
            <i className="bi bi-cart-fill"></i>  {submitting ? "Đang thanh toán..." : "Thanh toán"}
          </button>

        </form>
      </div>

      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        handleOrderSubmit={handleOrderSubmit}
        submitting={submitting}
        total={total}
      />
    </>
  );
}