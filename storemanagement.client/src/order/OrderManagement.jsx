import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Eye, Funnel, CreditCard, PlusCircleFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import OrderViewModal from "./OrderViewModal";
import OrderFilterModal from "./OrderFilterModal";
import { toVNPrice, toVNDate } from "../util"

const statusBadge = (raw) => {
  const s = String(raw || "").toLowerCase();
  const map = {
    pending: { type: "warning", label: "Chờ thanh toán" },
    paid: { type: "success", label: "Đã thanh toán" },
    canceled: { type: "danger", label: "Đã hủy" },
    cancelled: { type: "danger", label: "Đã hủy" },
  };
  const cfg = map[s] ?? { type: "secondary", label: raw ?? "" };
  return <span className={`badge text-bg-${cfg.type}`}>{cfg.label}</span>;
};

export default function OrderManagement() {
  const navTo = useNavigate();
  const [orderList, setOrderList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openView, setOpenView] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    userId: "",
    promotionId: "",
    status: "",
    categoryId: "",
  });

  // Danh sách để hiển thị trong filter dropdown
  const [users, setUsers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [cashError, setCashError] = useState("");

  // Helpers định dạng và parse số theo kiểu VN (thêm dấu chấm hàng nghìn)
  const formatVNNumber = (val) => {
    const digits = String(val ?? "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const parseVNNumber = (val) => {
    const n = Number(String(val ?? "").replace(/\./g, ""));
    return isNaN(n) ? 0 : n;
  };

  const loadFromApi = async (q = "") => {
    const url = `/api/order`;
    const res = await axios.get(url);
    return res.data;
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const reloadData = async () => {
    try {
      const [orderData, userData, promoData, categoryData, productData] = await Promise.all([
        axios.get("/api/order"),
        axios.get("/api/user"),
        axios.get("/api/promotion"),
        axios.get("/api/category"),
        axios.get("/api/product"),
      ]);
      setOrderList(orderData.data ?? []);
      setUsers(userData.data ?? []);
      setPromotions(promoData.data ?? []);
      setCategories(categoryData.data ?? []);
      setProducts(productData.data ?? []);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleOpenFilter = async () => {
    await reloadData();
    setOpenFilter(true);
  };

  useEffect(() => {
    (async () => {
      document.title = "Đơn hàng | Quản lý kho hàng";
      setLoading(true);
      await reloadData();
      setLoading(false);
    })();
  }, []);

  const openPaymentModal = (order) => {
    setPaymentOrder(order);
    setSelectedPaymentMethod("");
    setCashReceived("");
    setCashError("");
    setShowPaymentModal(true);
  };
  
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentOrder(null);
    setSelectedPaymentMethod("");
    setCashReceived("");
    setCashError("");
  };
  
  const cancelPaymentModal = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const orderId = paymentOrder?.orderId ?? paymentOrder?.order_id;
      
      // Cập nhật status thành "canceled"
      await axios.put(`/api/order/${orderId}/status`, { status: "canceled" });
      
      // Reload danh sách
      const data = await loadFromApi();
      setOrderList(data ?? []);
      
      alert("Đã hủy đơn hàng thành công!");
      closePaymentModal();
    } catch (error) {
      console.error("Error canceling order:", error);
      alert("Lỗi khi hủy đơn hàng: " + (error.response?.data?.message || error.message));
    } finally {
      setProcessingPayment(false);
    }
  };

  const processPayment = async (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    if (paymentMethod === "cash") {
      // Hiện giao diện nhập tiền mặt, chưa gọi API
      setCashReceived("");
      setCashError("");
      return;
    }

    setShowPaymentModal(false);
    setProcessingPayment(true);
    try {
      const orderId = paymentOrder?.orderId ?? paymentOrder?.order_id;
      const totalAmount = paymentOrder?.totalAmount ?? paymentOrder?.total_amount;
      const customer = paymentOrder?.customer ?? { name: "Khách hàng" };

      // Tạo form submit đến MoMo
      const fields = {
        OrderId: orderId.toString(),
        Amount: Math.round(totalAmount).toString(),
        FullName: customer?.name || customer?.customerName || "Khách hàng",
        OrderInfo: `Thanh toán đơn hàng #${orderId}`
      };
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
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Lỗi thanh toán: " + (error.response?.data?.message || error.message));
    } finally {
      setProcessingPayment(false);
    }
  };

  const confirmCashPayment = async () => {
    setCashError("");
    const totalAmount = Number(paymentOrder?.totalAmount ?? paymentOrder?.total_amount ?? 0);
    const received = parseVNNumber(cashReceived);
    if (received < totalAmount) {
      setCashError("Số tiền nhận phải lớn hơn hoặc bằng tổng cộng!");
      return;
    }
    setProcessingPayment(true);
    try {
      const orderId = paymentOrder?.orderId ?? paymentOrder?.order_id;
      await axios.put(`/api/order/${orderId}/status`, { status: "paid" });
      const data = await loadFromApi();
      setOrderList(data ?? []);
      alert("Thanh toán tiền mặt thành công!");
      closePaymentModal();
    } catch (error) {
      console.error("Error confirming cash payment:", error);
      alert("Lỗi thanh toán tiền mặt: " + (error.response?.data?.message || error.message));
    } finally {
      setProcessingPayment(false);
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order || null);
    setOpenView(true);
  };

  const closeOrderModal = () => {
    setOpenView(false);
    setSelectedOrder(null);
  };

  // Lọc và tìm kiếm kết hợp
  const filteredOrders = useMemo(() => {
    try {
      let result = [...orderList];

      // 1. Áp dụng bộ lọc
      // Lọc theo ngày
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        result = result.filter((o) => {
          const orderDate = new Date(o.orderDate || o.order_date);
          return orderDate >= startDate;
        });
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Bao gồm cả ngày cuối
        result = result.filter((o) => {
          const orderDate = new Date(o.orderDate || o.order_date);
          return orderDate <= endDate;
        });
      }

      // Lọc theo nhân viên
      if (filters.userId) {
        result = result.filter((o) => {
          const userId = o.user?.id ?? o.user?.Id ?? o.userId ?? o.user_id;
          return String(userId) === String(filters.userId);
        });
      }

      // Lọc theo mã giảm giá
      if (filters.promotionId) {
        result = result.filter((o) => {
          // API trả về promo object, không phải promoId primitive
          const promoId = o.promo?.promoId ?? o.promo?.id ?? o.promoId ?? o.promo_id ?? o.promotionId ?? o.promotion_id;
          // Chuyển về string và trim để so sánh, xử lý cả null/undefined
          const orderPromoId = String(promoId || "").trim();
          const filterPromoId = String(filters.promotionId || "").trim();
          
          // Nếu không có promoId trong order (null/undefined/"") thì bỏ qua
          if (!orderPromoId) return false;
          
          return orderPromoId === filterPromoId;
        });
      }

      // Lọc theo trạng thái
      if (filters.status) {
        result = result.filter((o) => {
          const status = String(o.status || "").toLowerCase();
          return status === filters.status.toLowerCase();
        });
      }

      // Lọc theo loại sản phẩm (category)
      if (filters.categoryId && products.length > 0) {
        result = result.filter((o) => {
          const items = o.items || [];
          // Kiểm tra xem có sản phẩm nào trong đơn thuộc category đã chọn
          return items.some((item) => {
            const product = products.find(
              (p) => (p.productId || p.id) === (item.productId || item.product_id)
            );
            if (!product) return false;
            const productCategoryId = product.categoryId ?? product.category_id;
            return String(productCategoryId) === String(filters.categoryId);
          });
        });
      }

      // 2. Áp dụng tìm kiếm
      if (search.trim()) {
        const searchLower = search.toLowerCase().trim();
        result = result.filter((o) => {
          const orderId = String(o.orderId || o.order_id || "");
          const userName = o.user?.name || o.user?.Name || "";
          const userId = String(o.user?.id ?? o.user?.Id ?? o.userId ?? o.user_id ?? "");
          const status = String(o.status || "");
          const total = String(o.totalAmount || o.total_amount || "");

          return (
            orderId.toLowerCase().includes(searchLower) ||
            userName.toLowerCase().includes(searchLower) ||
            userId.toLowerCase().includes(searchLower) ||
            status.toLowerCase().includes(searchLower) ||
            total.includes(searchLower)
          );
        });
      }

      return result;
    } catch (error) {
      console.error("Error filtering orders:", error);
      return orderList;
    }
  }, [orderList, filters, search, products]);

  if (loading) return null;

  return (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">Quản lý đơn hàng</h1>

      <div className="d-flex column-gap-3 mb-3">

        <form className="col" onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            placeholder="Nhập ID đơn hàng, tổng tiền..."
            className="form-control"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </form>
        <button
          className="btn btn-outline-secondary"
          title="Lọc"
          aria-label="Lọc"
          onClick={handleOpenFilter}
        >
          <Funnel size={22} />
          Bộ lọc
        </button>
      </div>

      <table className="table table-striped table-hover table-bordered">
        <thead>
          <tr className="text-center">
            <th>ID đơn hàng</th>
            <th>Ngày tạo</th>
            <th>ID nhân viên</th>
            <th>Giảm giá</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center fst-italic">
                Không có đơn hàng!
              </td>
            </tr>
          ) : (
            filteredOrders.map((o) => {
              const orderId = o.order_id ?? o.orderId;
              const date = o.order_date ?? o.orderDate;
              // Backend trả về User là object { id, name }, không phải userId primitive
              const userId = (o.user && (o.user.id ?? o.user.Id)) ?? (o.userId ?? o.user_id);
              const userName = o.user?.name ?? o.user?.Name;
              const discount = o.discount_amount ?? o.discountAmount;
              const total = o.total_amount ?? o.totalAmount;
              const status = o.status;

              return (
                <tr key={`order-${orderId}`}>
                  <td>{orderId}</td>
                  <td className="text-center">{toVNDate(date)}</td>
                  <td className="text-center">{userName ? `${userName} (ID: ${userId ?? '-'})` : (userId ?? "-")}</td>
                  <td className="text-center">{toVNPrice(discount)}</td>
                  <td className="text-center">{toVNPrice(total)}</td>
                  <td className="text-center">{statusBadge(status)}</td>
                  <td className="text-center">                    
                    <button
                      className="btn p-0 me-2 border border-0"
                      title="Xem chi tiết"
                      onClick={() => openOrderModal(o)}
                    >
                      <Eye size={22} color="blue" />
                    </button>

                    {/* Hiện nút thanh toán nếu status = pending */}
                    {(status === "pending") && (
                      <button
                        className="btn p-0 border border-0"
                        title="Thanh toán"
                        onClick={() => openPaymentModal(o)}
                      >
                        <CreditCard size={22} color="green" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <OrderViewModal
        open={openView}
        order={selectedOrder}
        onClose={closeOrderModal}
      />
      <OrderFilterModal
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApplyFilter={handleApplyFilter}
        users={users}
        promotions={promotions}
        categories={categories}
        currentFilter={filters}
      />
      
      {/* Payment Method Selection Modal */}
      {showPaymentModal && paymentOrder && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedPaymentMethod === "cash" ? "Thanh toán tiền mặt" : "Chọn phương thức thanh toán"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closePaymentModal}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <strong>Đơn hàng:</strong> #{paymentOrder.orderId ?? paymentOrder.order_id}
                  </div>
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
                          disabled={processingPayment}
                        />
                        {cashError && <div className="text-danger mt-1">{cashError}</div>}
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mt-2">
                          <span>Tiền thối lại:</span>
                          <strong className="text-danger fs-5">
                            {(() => {
                              const totalAmount = Number(paymentOrder?.totalAmount ?? paymentOrder?.total_amount ?? 0);
                              const received = parseVNNumber(cashReceived);
                              if (received >= totalAmount) {
                                return toVNPrice(received - totalAmount);
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
                        onClick={() => processPayment("cash")}
                        disabled={processingPayment}
                      >
                        <i className="bi bi-cash-coin me-2"></i>
                        <strong>Tiền mặt</strong>
                        <div className="small text-muted">Thanh toán trực tiếp tại cửa hàng</div>
                      </button>
                      
                      <button
                        className="btn btn-outline-success btn-lg py-3 btn-momo-custom"
                        onClick={() => processPayment("online")}
                        disabled={processingPayment}
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
                      <strong className="text-primary fs-5">
                        {toVNPrice(paymentOrder.totalAmount ?? paymentOrder.total_amount)}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {selectedPaymentMethod === "cash" ? (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={closePaymentModal}
                        disabled={processingPayment}
                      >
                        Hủy
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={confirmCashPayment}
                        disabled={processingPayment}
                      >
                        Xác nhận
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={closePaymentModal}
                        disabled={processingPayment}
                      >
                        Đóng
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={cancelPaymentModal}
                        disabled={processingPayment}
                      >
                        Hủy đơn hàng
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
