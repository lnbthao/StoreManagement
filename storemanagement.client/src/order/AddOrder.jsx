import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash, PlusCircle } from "react-bootstrap-icons";
import { toVNPrice } from "../util";

export default function AddOrder() {
  const navTo = useNavigate();
  
  // Lấy user từ localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("currentUser");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  };
  
  const currentUser = getCurrentUser();
  
  // Form data
  const [customerId, setCustomerId] = useState("");
  const [promoId, setPromoId] = useState("");
  const [userId, setUserId] = useState(currentUser?.userId?.toString() || "1");
  
  // Lists for dropdowns
  const [customers, setCustomers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Cart items
  const [cart, setCart] = useState([]);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Payment method selection
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  // Tiền mặt: số tiền khách đưa và tiền thối lại
  const [cashReceived, setCashReceived] = useState("");
  const [cashError, setCashError] = useState("");

  // Helpers định dạng và parse số theo kiểu VN (thêm dấu chấm phân tách hàng nghìn)
  const formatVNNumber = (val) => {
    const digits = String(val ?? "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const parseVNNumber = (val) => {
    const n = Number(String(val ?? "").replace(/\./g, ""));
    return isNaN(n) ? 0 : n;
  };

  useEffect(() => {
    document.title = "Tạo đơn hàng | Quản lý kho hàng";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customerRes, productRes, promoRes] = await Promise.all([
        axios.get("/api/customer"),
        axios.get("/api/product"),
        axios.get("/api/promotion"),
      ]);
      
      setCustomers(customerRes.data ?? []);
      setProducts(productRes.data ?? []);
      setPromotions(promoRes.data ?? []);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Không thể tải dữ liệu. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart
  const addToCart = () => {
    const newItem = {
      id: Date.now(), // Temporary ID for UI
      productId: "",
      productName: "",
      price: 0,
      quantity: 1,
      subtotal: 0,
    };
    setCart([...cart, newItem]);
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Update cart item
  const updateCartItem = (id, field, value) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          // If product changed, update price and name
          if (field === "productId") {
            const product = products.find(
              (p) => String(p.productId) === String(value)
            );
            if (product) {
              updated.price = product.price;
              updated.productName = product.productName;
            }
          }
          
          // Always recalculate subtotal after any change
          updated.quantity = Number(updated.quantity) || 0;
          updated.price = Number(updated.price) || 0;
          
          // Kiểm tra tồn kho khi thay đổi số lượng
          if (field === "quantity" && updated.productId) {
            const product = products.find(
              (p) => String(p.productId) === String(updated.productId)
            );
            if (product && updated.quantity > product.stock) {
              alert(`Sản phẩm "${product.productName}" chỉ còn ${product.stock} sản phẩm trong kho!`);
              updated.quantity = product.stock;
            }
          }
          
          updated.subtotal = updated.quantity * updated.price;
          
          return updated;
        }
        return item;
      })
    );
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    
    // Find selected promotion
    const promo = promotions.find((p) => String(p.promoId) === String(promoId));
    let discount = 0;
    
    if (promo) {
      if (promo.discountType === "percentage") {
        discount = (subtotal * (promo.discountValue || 0)) / 100;
      } else {
        discount = promo.discountValue || 0;
      }
    }
    
    // Không cho phép giảm giá nhiều hơn tổng tiền
    if (discount > subtotal) {
      discount = subtotal;
    }
    
    const total = Math.max(0, subtotal - discount); // Đảm bảo không âm
    
    return { subtotal, discount, total };
  };

  const { subtotal, discount, total } = calculateTotals();

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("=== BẮT ĐẦU TẠO ĐỢN HÀNG ===");
    
    // Validation
    if (!customerId) {
      alert("Vui lòng chọn khách hàng!");
      return;
    }
    
    if (cart.length === 0) {
      alert("Vui lòng thêm một sản phẩm!");
      return;
    }
    
    // Check if all cart items have product selected
    const hasEmptyProduct = cart.some((item) => !item.productId);
    if (hasEmptyProduct) {
      alert("Vui lòng chọn sản phẩm cho tất cả các mục trong giỏ hàng!");
      return;
    }
    
    // Check if all quantities > 0
    const hasInvalidQuantity = cart.some((item) => item.quantity <= 0);
    if (hasInvalidQuantity) {
      alert("Số lượng phải lớn hơn 0!");
      return;
    }
    
    // Check stock availability for all products
    for (const item of cart) {
      const product = products.find(
        (p) => String(p.productId) === String(item.productId)
      );
      if (product && item.quantity > product.stock) {
        alert(
          `Sản phẩm "${product.productName}" không đủ hàng trong kho!\n` +
          `Số lượng yêu cầu: ${item.quantity}\n` +
          `Tồn kho: ${product.stock}`
        );
        return;
      }
    }
    
    // Check if total amount is valid
    if (total < 0) {
      alert("Tổng tiền không hợp lệ! Vui lòng kiểm tra lại giảm giá.");
      return;
    }

    console.log("Validation passed, hiển thị modal chọn thanh toán...");
    
    // Show payment method selection modal instead of submitting directly
    setShowPaymentModal(true);
  };
  
  // Process order after payment method is selected
  const processOrder = async (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    if (paymentMethod === "cash") {
      setCashReceived("");
      setCashError("");
      // Hiện giao diện nhập tiền mặt
      return;
    }
    // Online: xử lý như cũ
    await handleOrderSubmit(paymentMethod);
  };

  // Xác nhận thanh toán tiền mặt
  const confirmCashPayment = async () => {
    setCashError("");
    const received = parseVNNumber(cashReceived);
    if (received < total) {
      setCashError("Số tiền nhận phải lớn hơn hoặc bằng tổng cộng!");
      return;
    }
    await handleOrderSubmit("cash");
  };

  // Hàm xử lý submit đơn hàng thực tế
  const handleOrderSubmit = async (paymentMethod) => {
    setShowPaymentModal(false);
    setSubmitting(true);
    try {
      // Prepare order data
      const orderData = {
        customerId: parseInt(customerId),
        userId: parseInt(userId),
        promoId: promoId ? parseInt(promoId) : null,
        orderDate: new Date().toISOString(),
        status: "pending",
        totalAmount: total,
        
        discountAmount: discount,
        orderItems: cart.map((item) => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          subtotal: parseFloat(item.subtotal),
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
        navTo("/admin/order");
      } else if (paymentMethod === "online") {
        // Gửi POST form để trình duyệt follow Redirect từ backend (không dùng axios)
        try {
          const customer = customers.find(c => c.customerId === parseInt(customerId));
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
          navTo("/admin/order");
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
  };

  if (loading) {
    return <div className="text-center p-5">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="container-fluid">
      <h1 className="text-center text-uppercase mb-4 fs-2">Tạo đơn hàng mới</h1>

      <form onSubmit={handleSubmit}>
        <div className="row mb-4">
          {/* Customer Selection */}
          <div className="col-md-4">
            <label className="form-label">
              Khách hàng <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">-- Chọn khách hàng --</option>
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.customerName} - {c.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Promotion Selection */}
          <div className="col-md-4">
            <label className="form-label">Khuyến mãi (tùy chọn)</label>
            <select
              className="form-select"
              value={promoId}
              onChange={(e) => setPromoId(e.target.value)}
            >
              <option value="">-- Không áp dụng --</option>
              {promotions.map((p) => (
                <option key={p.promoId} value={p.promoId}>
                  {p.promoName} (
                  {p.discountType === "percentage"
                    ? `${p.discountValue}%`
                    : toVNPrice(p.discountValue)}
                  )
                </option>
              ))}
            </select>
          </div>

          {/* User ID (hidden or auto-filled) */}
          <div className="col-md-4">
            <label className="form-label">Nhân viên tạo đơn</label>
            <input
              type="text"
              className="form-control"
              value={currentUser ? `${currentUser.fullName} (ID: ${userId})` : `User ID: ${userId}`}
              readOnly
              disabled
            />
          </div>
        </div>

        {/* Cart Section */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Danh sách sản phẩm</h5>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={addToCart}
            >
              <PlusCircle className="me-1" />
              Thêm sản phẩm
            </button>
          </div>
          <div className="card-body">
            {cart.length === 0 ? (
              <p className="text-center text-muted fst-italic">
                Chưa có sản phẩm nào trong giỏ hàng
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr className="text-center">
                      <th style={{ width: "40%" }}>Sản phẩm</th>
                      <th style={{ width: "15%" }}>Đơn giá</th>
                      <th style={{ width: "15%" }}>Số lượng</th>
                      <th style={{ width: "20%" }}>Thành tiền</th>
                      <th style={{ width: "10%" }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <select
                            className="form-select"
                            value={item.productId}
                            onChange={(e) =>
                              updateCartItem(item.id, "productId", e.target.value)
                            }
                            required
                          >
                            <option value="">-- Chọn sản phẩm --</option>
                            {products.map((p) => (
                              <option key={p.productId} value={p.productId}>
                                {p.productName} - Tồn: {p.stock}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control text-end"
                            value={item.price}
                            onChange={(e) =>
                              updateCartItem(item.id, "price", e.target.value)
                            }
                            min="0"
                            step="0.01"
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control text-center"
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartItem(item.id, "quantity", e.target.value)
                            }
                            min="1"
                            required
                            style={{
                              borderColor: (() => {
                                const product = products.find(
                                  (p) => String(p.productId) === String(item.productId)
                                );
                                return product && item.quantity > product.stock
                                  ? "red"
                                  : "";
                              })(),
                            }}
                          />
                          {(() => {
                            const product = products.find(
                              (p) => String(p.productId) === String(item.productId)
                            );
                            if (product && item.quantity > product.stock) {
                              return (
                                <small className="text-danger">
                                  Vượt quá tồn kho ({product.stock})
                                </small>
                              );
                            }
                            return null;
                          })()}
                        </td>
                        <td className="text-end align-middle">
                          <strong>{toVNPrice(item.subtotal || 0)}</strong>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-8"></div>
              <div className="col-md-4">
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td className="text-end">Tạm tính:</td>
                      <td className="text-end">
                        <strong>{toVNPrice(subtotal)}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-end">Giảm giá:</td>
                      <td className="text-end text-danger">
                        <strong>- {toVNPrice(discount)}</strong>
                      </td>
                    </tr>
                    <tr className="table-active">
                      <td className="text-end">
                        <strong>Tổng cộng:</strong>
                      </td>
                      <td className="text-end">
                        <strong className="text-primary fs-5">
                          {toVNPrice(total)}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navTo("/admin/order")}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-success"
            disabled={submitting}
          >
            {submitting ? "Đang tạo..." : "Tạo đơn hàng"}
          </button>
        </div>
      </form>

      {/* Payment Method Selection Modal */}
      {showPaymentModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedPaymentMethod === "cash"
                      ? "Thanh toán tiền mặt"
                      : "Chọn phương thức thanh toán"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedPaymentMethod("");
                    }}
                  />
                </div>
                <div className="modal-body">
                  {selectedPaymentMethod === "cash" ? (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Số tiền khách đưa <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="form-control form-control-lg"
                          value={cashReceived}
                          onChange={(e) => {
                            setCashReceived(formatVNNumber(e.target.value));
                            if (cashError) setCashError("");
                          }}
                          placeholder="Nhập số tiền khách đưa..."
                          disabled={submitting}
                        />
                        {cashError && (
                          <div className="text-danger mt-1">{cashError}</div>
                        )}
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mt-2">
                          <span>Tiền thối lại:</span>
                          <strong className="text-danger fs-5">
                            {(() => {
                              const received = parseVNNumber(cashReceived);
                              if (received >= total) {
                                return toVNPrice(received - total);
                              }
                              return toVNPrice(0);
                            })()}
                          </strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="d-grid gap-3">
                      <button
                        className="btn btn-outline-primary btn-lg py-3"
                        onClick={() => processOrder("cash")}
                        disabled={submitting}
                      >
                        <i className="bi bi-cash-coin me-2"></i>
                        <strong>Tiền mặt</strong>
                        <div className="small text-muted">Thanh toán trực tiếp tại cửa hàng</div>
                      </button>
                      <button
                        className="btn btn-outline-success btn-lg py-3 btn-momo-custom"
                        onClick={() => processOrder("online")}
                        disabled={submitting}
                      >
                       <i className="bi bi-credit-card me-2"></i>
                        <strong>Momo</strong>
                        <div className="small text-muted">MoMo E-Wallet</div>
                      </button>
                    </div>
                  )}
                  <div className="mt-3 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Tổng tiền:</span>
                      <strong className="text-primary fs-5">{toVNPrice(total)}</strong>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {selectedPaymentMethod === "cash" ? (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowPaymentModal(false);
                          setSelectedPaymentMethod("");
                        }}
                        disabled={submitting}
                      >
                        Hủy
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={confirmCashPayment}
                        disabled={submitting}
                      >
                        Xác nhận
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowPaymentModal(false)}
                      disabled={submitting}
                    >
                      Đóng
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
