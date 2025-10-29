import { useEffect, useState } from "react";

export default function OrderStatusModal({ open, order, onClose, onSave }) {
  const [status, setStatus] = useState(order?.status ?? "pending");

  useEffect(() => {
    setStatus(order?.status ?? "pending");
  }, [order]);

  if (!open || !order) return null;

  const fmtMoney = (n) =>
    Number(n || 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  return (
    <>
      <div className="modal-backdrop fade show" />

      <div
        className="modal d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Cập nhật trạng thái đơn #{order.order_id ?? order.orderId}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <strong>Khách hàng:</strong>{" "}
                  {order.customer_id ?? order.customerId}
                </div>
                <div className="col-md-6">
                  <strong>Nhân viên:</strong> {order.user_id ?? order.userId}
                </div>
                <div className="col-md-6">
                  <strong>Mã KM:</strong>{" "}
                  {order.promo_id ?? order.promoId ?? "-"}
                </div>
                <div className="col-md-6">
                  <strong>Ngày tạo:</strong>{" "}
                  {order.order_date
                    ? new Date(order.order_date).toLocaleString("vi-VN")
                    : order.orderDate
                    ? new Date(order.orderDate).toLocaleString("vi-VN")
                    : ""}
                </div>
                <div className="col-md-6">
                  <strong>Tổng tiền:</strong>{" "}
                  {fmtMoney(order.total_amount ?? order.totalAmount)}
                </div>
                <div className="col-md-6">
                  <strong>Giảm giá:</strong>{" "}
                  {fmtMoney(order.discount_amount ?? order.discountAmount)}
                </div>
              </div>

              <hr className="my-3" />

              <div>
                <label className="d-block mb-1">Trạng thái:</label>
                <select
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                  <option value="canceled">canceled</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onSave(status)}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
