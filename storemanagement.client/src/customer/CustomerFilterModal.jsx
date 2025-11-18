import { useState, useEffect } from "react";

export default function CustomerFilterModal({ open, onClose, onFilter, currentFilters = {} }) {
  const [filters, setFilters] = useState({
    hasPhone: '',
    hasEmail: '',
    hasAddress: '',
    createdFrom: '',
    createdTo: '',
    status: '',
    ...currentFilters
  });

  useEffect(() => {
    if (open) {
      setFilters({
        hasPhone: '',
        hasEmail: '',
        hasAddress: '',
        createdFrom: '',
        createdTo: '',
        status: 'active',
        ...currentFilters
      });
    }
  }, [open, currentFilters]);

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilter = () => {
    onFilter(filters);
    onClose();
  };

  const handleClearFilter = () => {
    setFilters({
      hasPhone: '',
      hasEmail: '',
      hasAddress: '',
      createdFrom: '',
      createdTo: '',
      status: ''
    });
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
        <div className="modal-dialog" onClick={stop}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Bộ lọc: Khách hàng</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="hasPhone" className="form-label">
                      Có số điện thoại
                    </label>
                    <select
                      id="hasPhone"
                      className="form-select"
                      value={filters.hasPhone}
                      onChange={(e) => handleInputChange('hasPhone', e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      <option value="true">Có</option>
                      <option value="false">Không có</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="hasEmail" className="form-label">
                      Có email
                    </label>
                    <select
                      id="hasEmail"
                      className="form-select"
                      value={filters.hasEmail}
                      onChange={(e) => handleInputChange('hasEmail', e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      <option value="true">Có</option>
                      <option value="false">Không có</option>
                    </select>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="hasAddress" className="form-label">
                      Có địa chỉ
                    </label>
                    <select
                      id="hasAddress"
                      className="form-select"
                      value={filters.hasAddress}
                      onChange={(e) => handleInputChange('hasAddress', e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      <option value="true">Có</option>
                      <option value="false">Không có</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="status" className="form-label">
                      Trạng thái
                    </label>
                    <select
                      id="status"
                      className="form-select"
                      value={filters.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Vô hiệu hóa</option>
                      <option value="">Tất cả</option>
                    </select>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="createdFrom" className="form-label">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      id="createdFrom"
                      className="form-control"
                      value={filters.createdFrom}
                      onChange={(e) => handleInputChange('createdFrom', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="createdTo" className="form-label">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      id="createdTo"
                      className="form-control"
                      value={filters.createdTo}
                      onChange={(e) => handleInputChange('createdTo', e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={handleClearFilter}>
                Xóa bộ lọc
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
              <button className="btn btn-primary" onClick={handleApplyFilter}>
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
