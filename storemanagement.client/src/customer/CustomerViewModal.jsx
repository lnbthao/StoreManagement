import { toVNDateTime, splitPhoneNumber } from "../util";

export default function CustomerViewModal({ open, customer, onClose }) {
  if (!open || !customer) return null;

  const c = customer || {};

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
        <div className="modal-dialog " onClick={stop}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Khách hàng #{c.customerId}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="mb-2">
                <strong>Tên KH:</strong> {c.name || "-"}
              </div>
              <div className="mb-2">
                <strong>Điện thoại:</strong> {splitPhoneNumber(c.phone) || "-"}
              </div>
              <div className="mb-2">
                <strong>Email:</strong> {c.email || "-"}
              </div>
              <div className="mb-2">
                <strong>Địa chỉ:</strong> {c.address || "-"}
              </div>
              {c.createdAt && (
                <div className="mb-2">
                  <strong>Ngày tạo:</strong> {toVNDateTime(c.createdAt)}
                </div>
              )}
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
