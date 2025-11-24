import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash, PlusCircle } from "react-bootstrap-icons";
import { toVNPrice, toVNDate } from "../util";
import PaymentModal from "../components/order/PaymentModal";

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
  
  // Autocomplete states
  const [customerSearch, setCustomerSearch] = useState("");
  const [promoSearch, setPromoSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showPromoDropdown, setShowPromoDropdown] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  
  // Cart items
  const [cart, setCart] = useState([]);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Payment method selection
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    document.title = "Tạo đơn hàng | Quản lý kho hàng";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customerRes, productRes, promoRes] = await Promise.all([
        axios.get("/api/customer"),
        axios.get("/api/product"),
        axios.get("/api/promotion", { params: { availableOnly: true } }),
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
            if (product) {
              const maxStock = product.stock || product.Stock || product.quantity || 0;
              if (updated.quantity > maxStock) {
                updated.quantity = maxStock;
              }
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
      if (promo.discountType === "percent") {
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

  // Filter customers based on search
  const filteredCustomers = customers.filter(c => {
    const searchLower = customerSearch.toLowerCase();
    return (
      c.customerName?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchLower)
    );
  });

  // Filter promotions based on search
  const filteredPromotions = promotions.filter(p => {
    const searchLower = promoSearch.toLowerCase();
    return (
      p.promoName?.toLowerCase().includes(searchLower) ||
      p.promoCode?.toLowerCase().includes(searchLower) ||
      p.PromoCode?.toLowerCase().includes(searchLower)
    );
  });

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setCustomerId(customer.customerId);
    setCustomerSearch(`${customer.customerName} - ${customer.phone}`);
    setShowCustomerDropdown(false);
  };

  // Handle promotion selection
  const handlePromoSelect = (promo) => {
    setPromoId(promo.promoId);
    const promoCode = promo.PromoCode || promo.promoCode;
    const discountText = promo.discountType === "percent" ? `${promo.discountValue}%` : toVNPrice(promo.discountValue);
    setPromoSearch(`${promoCode} - ${discountText}`);
    setSelectedPromotion(promo);
    setShowPromoDropdown(false);
  };

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
      if (product) {
        const maxStock = product.stock || product.Stock || product.quantity || 0;
        if (item.quantity > maxStock) {
          alert(
            `Sản phẩm "${product.productName}" không đủ hàng trong kho!\n` +
            `Số lượng yêu cầu: ${item.quantity}\n` +
            `Tồn kho: ${maxStock}`
          );
          return;
        }
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
      <h1 className="text-center text-uppercase mb-3 fs-2">Tạo đơn hàng mới</h1>

      <form onSubmit={handleSubmit}>
        <div className="row mb-4">
          {/* Customer Selection */}
          <div className="col-md-4 position-relative">
            <label className="form-label">
              Khách hàng <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập tên hoặc số điện thoại khách hàng..."
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
                if (!e.target.value) setCustomerId("");
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              required={!customerId}
            />
            {showCustomerDropdown && customerSearch && (
              <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <div
                      key={c.customerId}
                      className="p-2 cursor-pointer hover-bg-light"
                      style={{ cursor: "pointer" }}
                      onMouseDown={() => handleCustomerSelect(c)}
                    >
                      {c.customerName} - {c.phone}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-muted fst-italic">Không tìm thấy khách hàng</div>
                )}
              </div>
            )}
          </div>

          {/* Promotion Selection */}
          <div className="col-md-4 position-relative">
            <label className="form-label">Khuyến mãi (tùy chọn)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập tên hoặc mã khuyến mãi..."
              value={promoSearch}
              onChange={(e) => {
                setPromoSearch(e.target.value);
                setShowPromoDropdown(true);
                if (!e.target.value) {
                  setPromoId("");
                  setSelectedPromotion(null);
                }
              }}
              onFocus={() => setShowPromoDropdown(true)}
            />
            {showPromoDropdown && (
              <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}>
                <div
                  className="p-2 cursor-pointer hover-bg-light"
                  style={{ cursor: "pointer" }}
                  onMouseDown={() => {
                    setPromoId("");
                    setPromoSearch("");
                    setSelectedPromotion(null);
                    setShowPromoDropdown(false);
                  }}
                >
                  <em className="text-muted">-- Không áp dụng --</em>
                </div>
                {filteredPromotions.length > 0 ? (
                  filteredPromotions.map((p) => (
                    <div
                      key={p.promoId}
                      className="p-2 cursor-pointer hover-bg-light"
                      style={{ cursor: "pointer" }}
                      onMouseDown={() => handlePromoSelect(p)}
                    >
                      <strong>{p.PromoCode || p.promoCode}</strong> - {p.discountType === "percent" ? `${p.discountValue}%` : toVNPrice(p.discountValue)}
                    </div>
                  ))
                ) : (
                  promoSearch && <div className="p-2 text-muted fst-italic">Không tìm thấy khuyến mãi</div>
                )}
              </div>
            )}
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
                            {products.map((p) => {
                              const stock = p.stock || p.Stock || p.quantity || 0;
                              return (
                                <option
                                  key={p.productId} value={p.productId}
                                  disabled={stock === 0}
                                >
                                  {p.productName} - Tồn: {stock}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control text-end"
                            value={item.price}
                            readOnly
                            disabled
                            style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control text-center"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 0;
                              const product = products.find(
                                (p) => String(p.productId) === String(item.productId)
                              );
                              const maxStock = product?.stock || product?.Stock || product?.quantity || 0;
                              
                              if (newQty > maxStock) {
                                alert(`Số lượng không được vượt quá tồn kho (${maxStock})`);
                                updateCartItem(item.id, "quantity", maxStock);
                              } else {
                                updateCartItem(item.id, "quantity", newQty);
                              }
                            }}
                            min="1"
                            max={(() => {
                              const product = products.find(
                                (p) => String(p.productId) === String(item.productId)
                              );
                              return product?.stock || product?.Stock || product?.quantity || 999;
                            })()}
                            required
                            style={{
                              borderColor: (() => {
                                const product = products.find(
                                  (p) => String(p.productId) === String(item.productId)
                                );
                                const maxStock = product?.stock || product?.Stock || product?.quantity || 0;
                                return item.quantity > maxStock ? "red" : "";
                              })(),
                            }}
                          />
                          {(() => {
                            const product = products.find(
                              (p) => String(p.productId) === String(item.productId)
                            );
                            const maxStock = product?.stock || product?.Stock || product?.quantity || 0;
                            if (item.quantity > maxStock && maxStock > 0) {
                              return (
                                <small className="text-danger">
                                  Vượt quá tồn kho ({maxStock})
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
      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        submitting={submitting}
        handleOrderSubmit={handleOrderSubmit}
        total={total}
      />
    </div>
  );
}