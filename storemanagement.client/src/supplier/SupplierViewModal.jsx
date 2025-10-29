import { toVNDateTime, splitPhoneNumber } from '../util';

export default function SupplierViewModal({ open, supplier, onClose }) {
  if (!open) return null;

  const s = supplier || {};
  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Nhà cung cấp {s.supplierId ? `#${s.supplierId}` : ""}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="mb-2">
                <strong>Tên nhà cung cấp:</strong> {s.supplierName || "-"}
              </div>
              <div className="mb-2">
                <strong>Điện thoại:</strong> {splitPhoneNumber(s.phone) || "-"}
              </div>
              <div className="mb-2">
                <strong>Email:</strong> {s.email || "-"}
              </div>
              <div className="mb-2">
                <strong>Địa chỉ:</strong> {s.address || "-"}
              </div>
              {s.createdAt && (
                <div className="mb-2">
                  <strong>Ngày tạo:</strong>{" "}
                  {toVNDateTime(s.createdAt)}
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
