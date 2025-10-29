import { Axios } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InventoryModal({ open, onClose }) {
  if (!open) return null;

  const navTo = useNavigate();
  const [quantity, setQuantity] = useState(0);

  const handleClose = () => {
    setQuantity(0);
    onClose();
  }

  const handleUpdateInventory = () => {
    // TO DO: Gọi api update tồn kho ở backend

    alert("Thêm tồn kho thành công!");
    navTo(0); // Tải lại trang!
  }

  const stop = (e) => e.stopPropagation();

  return (
    <>
      <div className="modal-backdrop fade show" onClick={handleClose} />
      <div
        className="modal d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        onClick={handleClose}
      >
        <div className="modal-dialog " onClick={stop}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Thêm số lượng sản phẩm</h5>
              <button type="button" className="btn-close" onClick={handleClose} />
            </div>
            <div className="modal-body">
              <form noValidate>
                <label htmlFor="add-quantity" className="form-label">
                  Nhập số lượng cần thêm:
                </label>

                <input
                  type="number" id="add-quantity"
                  className={`form-control ${quantity < 1 ? "is-invalid" : ""}`}
                  value={quantity}
                  min={0}
                  onChange={e => {
                    setQuantity(e.target.value)
                  }}
                />

                <small className="invalid-feedback">Vui lòng nhập số lượng lớn hơn 0!</small>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleUpdateInventory}>
                Thêm
              </button>
              <button className="btn btn-secondary" onClick={handleClose}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
