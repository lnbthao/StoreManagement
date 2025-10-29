import { useMemo } from "react";

export default function OrderViewModal({ open, order, onClose }) {
  if (!open || !order) return null;

  const o = order || {};

  const fmtMoney = (n) =>
    Number(n || 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "");

  const StatusBadge = useMemo(() => {
    const s = String(o.status || "").toLowerCase();
    const map = { pending: "warning", paid: "success", canceled: "danger" };
    const color = map[s] || "secondary";
    return <span className={`badge bg-${color}`}>{o.status}</span>;
  }, [o.status]);

  const stop = (e) => e.stopPropagation();

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
        <div className="modal-dialog modal-xl " onClick={stop}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Đơn hàng #{o.order_id ?? o.orderId}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <small className="text-muted d-block">Khách hàng</small>
                  <div className="fw-semibold">
                    {o.customer_id ?? o.customerId}
                  </div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Nhân viên</small>
                  <div className="fw-semibold">{o.user_id ?? o.userId}</div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Mã KM</small>
                  <div className="fw-semibold">
                    {o.promo_id ?? o.promoId ?? "-"}
                  </div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Ngày tạo</small>
                  <div className="fw-semibold">
                    {fmtDateTime(o.order_date ?? o.orderDate)}
                  </div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Trạng thái</small>
                  <div className="fw-semibold">{StatusBadge}</div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Tổng tiền</small>
                  <div className="fw-semibold">
                    {fmtMoney(o.total_amount ?? o.totalAmount)}
                  </div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Giảm giá</small>
                  <div className="fw-semibold">
                    {fmtMoney(o.discount_amount ?? o.discountAmount)}
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              {/* KHU VỰC DÀNH CHO SẢN PHẨM TRONG ĐƠN */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Sản phẩm trong đơn</h6>
                </div>

                {/* Bảng sản phẩm – hiện để trống (placeholder).
                    Sau này bạn truyền props: items = [{productId, name, qty, price, subtotal}, ...] */}
                <table className="table table-sm table-bordered mb-0">
                  <thead>
                    <tr className="text-center">
                      <th style={{ width: 90 }}>Mã SP</th>
                      <th>Tên sản phẩm</th>
                      <th style={{ width: 120 }}>Số lượng</th>
                      <th style={{ width: 160 }}>Đơn giá</th>
                      <th style={{ width: 160 }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* TODO: map items ở đây.
                        Ví dụ:
                        items?.map((it) => (
                          <tr key={it.productId}>
                            <td className="text-center">{it.productId}</td>
                            <td>{it.name}</td>
                            <td className="text-end">{it.qty}</td>
                            <td className="text-end">{fmtMoney(it.price)}</td>
                            <td className="text-end">{fmtMoney(it.subtotal)}</td>
                          </tr>
                        ))
                    */}
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center text-muted fst-italic"
                      >
                        Chưa có dữ liệu sản phẩm — thêm sau.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

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
