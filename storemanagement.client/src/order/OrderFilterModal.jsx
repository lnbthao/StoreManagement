import { useState } from "react";

export default function OrderFilterModal({ 
  open, 
  onClose, 
  onApplyFilter,
  users = [],
  promotions = [],
  categories = [],
  currentFilter = {}
}) {
  const [localFilters, setLocalFilters] = useState({
    startDate: currentFilter.startDate || "",
    endDate: currentFilter.endDate || "",
    userId: currentFilter.userId || "",
    promotionId: currentFilter.promotionId || "",
    status: currentFilter.status || "",
    categoryId: currentFilter.categoryId || "",
  });

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilter(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: "",
      endDate: "",
      userId: "",
      promotionId: "",
      status: "",
      categoryId: "",
    };
    setLocalFilters(resetFilters);
    onApplyFilter(resetFilters);
    onClose();
  };

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
        <div className="modal-dialog modal-lg" onClick={stop}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Bộ lọc: Đơn hàng</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  {/* Ngày tạo */}
                  <div className="col-md-6">
                    <label className="form-label">Từ ngày</label>
                    <input
                      type="date"
                      className="form-control"
                      value={localFilters.startDate}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Đến ngày</label>
                    <input
                      type="date"
                      className="form-control"
                      value={localFilters.endDate}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, endDate: e.target.value })
                      }
                    />
                  </div>

                  {/* Nhân viên */}
                  <div className="col-md-6">
                    <label className="form-label">Nhân viên tạo</label>
                    <select
                      className="form-select"
                      value={localFilters.userId}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, userId: e.target.value })
                      }
                    >
                      <option value="">-- Tất cả nhân viên --</option>
                      {users.map((u) => (
                        <option key={u.userId || u.id} value={u.userId || u.id}>
                          {u.name || u.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mã giảm giá */}
                  <div className="col-md-6">
                    <label className="form-label">Mã giảm giá</label>
                    <select
                      className="form-select"
                      value={localFilters.promotionId}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, promotionId: e.target.value })
                      }
                    >
                      <option value="">-- Tất cả mã giảm giá --</option>
                      {promotions.map((p) => (
                        <option key={p.promoId || p.id} value={p.promoId || p.id}>
                          {p.promoCode || p.code} - {p.description || ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Trạng thái */}
                  <div className="col-md-6">
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-select"
                      value={localFilters.status}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, status: e.target.value })
                      }
                    >
                      <option value="">-- Tất cả trạng thái --</option>
                      <option value="pending">Chờ thanh toán</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="canceled">Đã hủy</option>
                    </select>
                  </div>

                  {/* Loại sản phẩm */}
                  <div className="col-md-6">
                    <label className="form-label">Loại sản phẩm trong đơn</label>
                    <select
                      className="form-select"
                      value={localFilters.categoryId}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, categoryId: e.target.value })
                      }
                    >
                      <option value="">-- Tất cả loại sản phẩm --</option>
                      {categories.map((c) => (
                        <option key={c.categoryId || c.id} value={c.categoryId || c.id}>
                          {c.categoryName || c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Hủy
                </button>
                <button type="button" className="btn btn-warning" onClick={handleReset}>
                  Xóa bộ lọc
                </button>
                <button type="submit" className="btn btn-primary">
                  Áp dụng
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
