import { useMemo } from "react";

export default function OrderViewModal({ open, order, onClose }) {
  if (!open || !order) return null;

  const o = order;

  const fmtMoney = (n) =>
    Number(n || 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "");

  const StatusBadge = useMemo(() => {
    const s = String(o.status || "").toLowerCase();
    const colorMap = { pending: "warning", paid: "success", canceled: "danger" };
    const textMap = { pending: "Chờ xác nhận", paid: "Đã thanh toán", canceled: "Đã hủy" };
    const color = colorMap[s] || "secondary";
    const text = textMap[s] || o.status;
    return <span className={`badge bg-${color}`}>{text}</span>;
  }, [o.status]);

  const stop = (e) => e.stopPropagation();

  const items = o.orderItems || [];

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />

      <div
        className="modal d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div className="modal-dialog modal-xl" onClick={stop}>
          <div className="modal-content">

            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title">Đơn hàng #{o.orderId}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            {/* BODY */}
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <small className="text-muted d-block">Khách hàng</small>
                  <div className="fw-semibold">
                    {o.customer ? `${o.customer.customerId} - ${o.customer.customerName}` : "-"}
                  </div>
                </div>

                <div className="col-md-3">
                  <small className="text-muted d-block">Nhân viên</small>
                  <div className="fw-semibold">
                    {o.user ? `${o.user.userId} - ${o.user.fullName}` : "-"}
                  </div>
                </div>

                <div className="col-md-3">
                  <small className="text-muted d-block">Mã khuyến mãi</small>
                  <div className="fw-semibold">
                    {o.promotion ? `${o.promotion.promoId} - ${o.promotion.promoCode}` : "-"}
                  </div>
                </div>


                <div className="col-md-3">
                  <small className="text-muted d-block">Ngày tạo</small>
                  <div className="fw-semibold">{fmtDateTime(o.orderDate)}</div>
                </div>

                <div className="col-md-3">
                  <small className="text-muted d-block">Trạng thái</small>
                  <div className="fw-semibold">{StatusBadge}</div>
                </div>

                <div className="col-md-3">
                  <small className="text-muted d-block">Tổng tiền</small>
                  <div className="fw-semibold">{fmtMoney(o.totalAmount)}</div>
                </div>

                <div className="col-md-3">
                  <small className="text-muted d-block">Giảm giá</small>
                  <div className="fw-semibold">{fmtMoney(o.discountAmount)}</div>
                </div>

                <div className="col-md-3">
                  <small className="text-muted d-block">Phải thanh toán</small>
                  <div className="fw-semibold">{fmtMoney(o.totalAmount - o.discountAmount)}</div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Tổng tiền</small>
                  <div className="fw-semibold text-primary fs-5">
                    {fmtMoney(o.total_amount ?? o.totalAmount)}
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              {/* ITEMS TABLE */}
              <div>
                <h6 className="mb-2">Sản phẩm trong đơn</h6>

                <table className="table table-sm table-bordered mb-0">
                  <thead className="table-light">
                    <tr className="text-center">
                      <th style={{ width: 90 }}>Mã SP</th>
                      <th>Tên sản phẩm</th>
                      <th style={{ width: 100 }}>Số lượng</th>
                      <th style={{ width: 140 }}>Đơn giá</th>
                      <th style={{ width: 140 }}>Thành tiền</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.length > 0 ? (
                      items.map((it) => (
                        <tr key={it.productId}>
                          <td className="text-center">{it.productId}</td>
                          <td>{it.product?.productName}</td>
                          <td className="text-end">{it.quantity}</td>
                          <td className="text-end">{fmtMoney(it.price)}</td>
                          <td className="text-end">
                            {fmtMoney(it.price * it.quantity)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-muted fst-italic">
                          Không có sản phẩm.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
