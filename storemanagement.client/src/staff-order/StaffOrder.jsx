import axios from "axios";
import { useEffect, useState } from "react";
import { Eye, Search } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import OrderViewModal from "../order/OrderViewModal";
import { toVNPrice, toVNDateTime } from "../util";

const statusBadge = (raw) => {
  const s = String(raw || "").toLowerCase();
  const map = {
    pending: { type: "warning", label: "chờ xác nhận" },
    paid: { type: "success", label: "đã thanh toán" },
    canceled: { type: "danger", label: "đã hủy" },
  };
  const cfg = map[s] ?? { type: "secondary", label: raw ?? "" };
  return <span className={`badge text-bg-${cfg.type}`}>{cfg.label}</span>;
};

export default function StaffOrder() {
  const navTo = useNavigate();
  const [orderList, setOrderList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openView, setOpenView] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadFromApi = async () => {
    const res = await axios.get("/api/order");
    return res.data;
  };

  useEffect(() => {
    (async () => {
      document.title = "Danh sách đơn hàng";
      try {
        const data = await loadFromApi();
        setOrderList(data ?? []);
      } catch (err) {
        console.error("API lỗi:", err);
        setOrderList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openOrderModal = (order) => {
    setSelectedOrder(order || null);
    setOpenView(true);
  };

  const closeOrderModal = () => {
    setOpenView(false);
    setSelectedOrder(null);
  };

  // Hành động tìm kiếm — chạy khi nhấn nút hoặc Enter
  const handleSubmitSearch = (e) => {
    if (e) e.preventDefault();
    setSearch(search.trim());
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3">Đang tải danh sách đơn hàng...</p>
      </div>
    );
  }

  const keyword = search.toLowerCase();

  const filteredList = orderList.filter((o) => {
    return (
      String(o.orderId).includes(keyword) ||
      String(o.user?.userId || "").includes(keyword) ||
      (o.user?.fullName || "").toLowerCase().includes(keyword) ||
      (o.customer?.fullName || "").toLowerCase().includes(keyword)
    );
  });

  return (
    <section className="h-dvh overflow-auto">
      <div className="d-flex column-gap-3 mb-3">
        <form className="input-group" onSubmit={handleSubmitSearch}>
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="search"
            placeholder="Tìm theo ID đơn hàng hoặc nhân viên"
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <table className="table table-striped table-hover table-bordered align-middle">
        <thead>
          <tr className="text-center align-middle">
            <th>ID đơn hàng</th>
            <th>Ngày tạo</th>
            <th>Nhân viên</th>
            <th>Khách hàng</th>
            <th>Giảm giá</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredList.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center fst-italic">
                Không có đơn hàng!
              </td>
            </tr>
          ) : (
            filteredList.map((o) => (
              <tr key={`order-${o.orderId}`}>
                <td>{o.orderId}</td>

                <td className="text-center">{toVNDateTime(o.orderDate)}</td>

                <td className="text-center">
                  {o.user
                    ? `${o.user.id} - ${o.user.name}`
                    : "Không có"}
                </td>

                <td className="text-center">
                        {o.user
                            ? (!o.customer ? "Khách vãng lai" : `${o.customer.id} - ${o.customer.name}`)
                    : "Không có"}
                </td>

                <td className="text-center">{toVNPrice(o.discountAmount)}</td>
                <td className="text-center">{toVNPrice(o.totalAmount)}</td>

                <td className="text-center">{statusBadge(o.status)}</td>

                <td className="text-center">
                  <button
                    className="btn p-0 border-0"
                    onClick={() => openOrderModal(o)}
                  >
                    <Eye size={22} color="blue" />
                        </button>

                </td>
                </tr>

            ))
          )}
        </tbody>
      </table>

      <OrderViewModal
        open={openView}
        order={selectedOrder}
        onClose={closeOrderModal}
      />
    </section>
  );
}
