export default function UserViewModal({ open, user, onClose }) {
  if (!open || !user) return null;

  const u = user || {};
  const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "");

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
              <h5 className="modal-title">Người dùng #{u.userId}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="mb-2">
                <strong>Username:</strong> {u.username || "-"}
              </div>
              <div className="mb-2">
                <strong>Họ tên:</strong> {u.fullName || "-"}
              </div>
              <div className="mb-2">
                <strong>Vai trò:</strong>{" "}
                <span
                  className={`badge bg-${
                    u.role === "admin" ? "danger" : "secondary"
                  }`}
                >
                  {u.role || "-"}
                </span>
              </div>
              {/* <div className="mb-2">
                <strong>Mật khẩu:</strong> ••••••
              </div> */}
              <div className="mb-2">
                <strong>Ngày tạo:</strong> {fmtDateTime(u.createdAt)}
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
