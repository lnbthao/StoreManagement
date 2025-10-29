import { useEffect, useMemo } from "react";
import { toVNNumber, toVNPrice, toVNDate } from "../util";

export default function PromotionViewModal({ open, promo, onClose }) {
  if (!open || !promo) return null;

  const p = promo || {};

  const displayType = useMemo(() => {
    if (!p.discountType) return "";
    return (p.discountType === "percent") ? "Phần trăm" : "Tiền mặt";
  }, [p.discountType]);

  const discountText = useMemo(() => {
    if (p.discountType === "percent") return `${p.discountValue ?? 0}%`;
    if (p.discountType === "fixed") return toVNPrice(p.discountValue ?? 0);
    return "-";
  }, [p.discountType, p.discountValue]);

  const usageText = useMemo(() => {
    // 0 = không giới hạn
    return Number(p.usageLimit || 0) === 0
      ? "Không giới hạn"
      : `${p.usedCount ?? 0}/${p.usageLimit}`;
  }, [p.usageLimit, p.usedCount]);

  const statusBadge = (raw) => {
    const s = String(raw || "").toLowerCase();
    const map = { active: "success", inactive: "danger" };
    const color = map[s] || "danger";
    return <span className={`badge text-bg-${color}`}>{raw}</span>;
  };

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
        <div className="modal-dialog  modal-lg" onClick={stop}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Khuyến mãi #{p.promoId} — {p.promoCode}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-8">
                  <strong>Mô tả:</strong>
                  <div>{p.description || "-"}</div>
                </div>
                <div className="col-md-4">
                  <strong>Trạng thái:</strong>
                  <div>{statusBadge(p.status)}</div>
                </div>

                <div className="col-md-4">
                  <small className="text-muted d-block">Loại giảm</small>
                  <div>{displayType}</div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Giá trị giảm</small>
                  <div>{discountText}</div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Đơn tối thiểu</small>
                  <div>
                    {Number(p.minOrderAmount || 0) > 0
                      ? toVNPrice(p.minOrderAmount)
                      : "Không yêu cầu"}
                  </div>
                </div>

                <div className="col-md-4">
                  <small className="text-muted d-block">Ngày bắt đầu</small>
                  <div>{toVNDate(p.startDate)}</div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Ngày kết thúc</small>
                  <div>{toVNDate(p.endDate)}</div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Lượt dùng</small>
                  <div>{toVNNumber(usageText)}</div>
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
