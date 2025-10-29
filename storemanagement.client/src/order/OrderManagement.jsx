import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Eye, Funnel, PencilSquare, PlusCircleFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { MOCK_ORDERS } from "../../mockData/order";
import OrderStatusModal from "./OrderStatusModal";
import OrderViewModal from "./OrderViewModal";
import OrderFilterModal from "./OrderFilterModal";
import { toVNPrice, toVNDate } from "../util"

const statusBadge = (raw) => {
  const s = String(raw || "").toLowerCase();
  const map = {
    pending: { type: "warning", label: "chờ xác nhận" }, // vàng
    paid: { type: "success", label: "đã thanh toán" }, // xanh lá
    canceled: { type: "danger", label: "đã hủy" }, // đỏ
  };
  const cfg = map[s] ?? { color: "secondary", label: raw ?? "" };
  return <span className={`badge text-bg-${cfg.type}`}>{cfg.label}</span>;
};

export default function OrderManagement() {
  const navTo = useNavigate();
  const [orderList, setOrderList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const [openView, setOpenView] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [openFilter, setOpenFilter] = useState(false);

  const loadFromApi = async (q = "") => {
    const url = `/api/order`;
    const res = await axios.get(url);
    return res.data;
  };

  const handleSearch = (value) => {
    setSearch(value);
    // TODO: lọc đơn hàng?
  };

  useEffect(() => {
    (async () => {
      document.title = "Đơn hàng | Quản lý kho hàng";
      try {
        const data = await loadFromApi();
        setOrderList(data ?? []);
      } catch {
        setOrderList(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openStatusModal = (order) => {
    setActiveOrder(order);
    setShowModal(true);
  };
  const closeStatusModal = () => {
    setShowModal(false);
    setActiveOrder(null);
  };

  const saveStatus = async (newStatus) => {
    try {
      // Nếu có API, bật lại đoạn gọi server:
      // const id = activeOrder.order_id ?? activeOrder.orderId;
      // await axios.put(`/api/order/${id}/status`, { status: newStatus });

      // Cập nhật ngay trên UI
      const id = activeOrder?.order_id ?? activeOrder?.orderId;
      const updated = { ...activeOrder, status: newStatus };

      setOrderList((prev) =>
        prev.map((o) => ((o.order_id ?? o.orderId) === id ? updated : o))
      );

      alert(JSON.stringify(updated, null, 2));

      closeStatusModal();
    } catch (e) {
      console.error(e);
      alert("Cập nhật trạng thái thất bại!");
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

  if (loading) return null;

  return (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">Quản lý đơn hàng</h1>

      <div className="d-flex column-gap-3 mb-3">
        <button
          className="btn btn-success"
          onClick={() => navTo("/order/add")}
          disabled
        >
          <PlusCircleFill className="me-1" /> Tạo đơn hàng
        </button>

        <form className="col" onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            placeholder="Nhập dữ liệu tìm kiếm"
            className="form-control"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </form>
        <button
          className="btn btn-outline-secondary"
          title="Lọc"
          aria-label="Lọc"
          onClick={() => setOpenFilter(true)}
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
          {orderList.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center fst-italic">
                Không có đơn hàng!
              </td>
            </tr>
          ) : (
            orderList.map((o) => {
              const orderId = o.order_id ?? o.orderId;
              const date = o.order_date ?? o.orderDate;
              const userId = o.user_id ?? o.userId;
              const discount = o.discount_amount ?? o.discountAmount;
              const total = o.total_amount ?? o.totalAmount;
              const status = o.status;

              return (
                <tr key={`order-${orderId}`}>
                  <td>{orderId}</td>
                  <td className="text-center">{toVNDate(date)}</td>
                  <td className="text-center">{userId}</td>
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

                    {
                      (status !== "pending") ? <></> : (
                        <button
                          className="btn p-0 border border-0"
                          title="Sửa"
                          onClick={() => openStatusModal(o)}
                        >
                          <PencilSquare size={22} color="darkcyan" />
                        </button>
                      )
                    }
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <OrderStatusModal
        open={showModal}
        order={activeOrder}
        onClose={closeStatusModal}
        onSave={saveStatus}
      />
      <OrderViewModal
        open={openView}
        order={selectedOrder}
        onClose={closeOrderModal}
      />
      <OrderFilterModal
        open={openFilter}
        onClose={() => setOpenFilter(false)}
      />
    </>
  );
}
