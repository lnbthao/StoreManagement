import { useEffect } from "react";
import { toVNPrice, toVNDate, splitPhoneNumber } from "../util"

export default function ProductViewModal({ open, product, onClose }) {
  if (!open || !product) return null;

  const p = product || {};
  const cat = p.category || {};
  const sup = p.supplier || {};

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
        <div className="modal-dialog modal-lg" onClick={stop}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sản phẩm #{p.productId}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-12">
                  <strong>Barcode:</strong>
                  <div>{p.barcode || "-"}</div>
                </div>
                <div className="col-md-6">
                  <strong>Tên sản phẩm:</strong>
                  <div>{p.productName || "-"}</div>
                </div>
                <div className="col-md-6">
                  <strong>Đơn vị:</strong>
                  <div>{p.unit || "-"}</div>
                </div>

                <div className="col-md-6">
                  <strong>Loại sản phẩm:</strong>
                  <div>
                    {cat.categoryName ? cat.categoryName : "-"}
                  </div>
                </div>

                <div className="col-md-6">
                  <strong>Giá:</strong>
                  <div>{toVNPrice(p.price)}</div>
                </div>

                <div className="col-md-6">
                  <strong>Nhà cung cấp:</strong>
                  <div>
                    {sup.name ? sup.name : "-"}
                  </div>
                </div>

                <div className="col-md-6">
                  <strong>Ngày tạo:</strong>
                  <div>{toVNDate(p.createdAt)}</div>
                </div>
              </div>

              <hr className="my-3" />

              <div>
                <strong>Thông tin nhà cung cấp</strong>
                <div className="row g-3 mt-1">
                  <div className="col-md-4">
                    <small className="text-muted d-block">Điện thoại</small>
                    <div>{splitPhoneNumber(sup.phone) || "-"}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Email</small>
                    <div>{sup.email || "-"}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Địa chỉ</small>
                    <div>{sup.address || "-"}</div>
                  </div>
                </div>
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
