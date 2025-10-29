export default function UserFilterModal({ open, onClose }) {
  if (!open) return null;

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
        <div className="modal-dialog" onClick={stop}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Bộ lọc: Người dùng</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">{/* TODO: form lọc người dùng */}</div>
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
