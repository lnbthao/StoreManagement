import { useState } from "react";
import { toVNPrice } from "../../util";

const PaymentModal = ({showPaymentModal = false, setShowPaymentModal, submitting, handleOrderSubmit, total}) => {
  // Payment method selection
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  
  // Tiền mặt: số tiền khách đưa và tiền thối lại
  const [cashReceived, setCashReceived] = useState("");
  const [cashError, setCashError] = useState("");

  // Helpers định dạng và parse số theo kiểu VN (thêm dấu chấm phân tách hàng nghìn)
  const formatVNNumber = (val) => {
    const digits = String(val ?? "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const parseVNNumber = (val) => {
    const n = Number(String(val ?? "").replace(/\./g, ""));
    return isNaN(n) ? 0 : n;
  };
  
  // Process order after payment method is selected
  const processOrder = async (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    if (paymentMethod === "cash") {
      setCashReceived("");
      setCashError("");
      // Hiện giao diện nhập tiền mặt
      return;
    }
    // Online: xử lý như cũ
    await handleOrderSubmit(paymentMethod);
  };

  // Xác nhận thanh toán tiền mặt
  const confirmCashPayment = async () => {
    setCashError("");
    const received = parseVNNumber(cashReceived);
    if (received < total) {
      setCashError("Số tiền nhận phải lớn hơn hoặc bằng tổng cộng!");
      return;
    }
    await handleOrderSubmit("cash");
  };

  const bodyCashPayment = () => {
    return (
      <>
        <div className="mb-3">
          <label className="form-label">Số tiền khách đưa <span className="text-danger">*</span></label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="form-control form-control-lg"
            value={cashReceived}
            onChange={(e) => {
              setCashReceived(formatVNNumber(e.target.value));
              if (cashError) setCashError("");
            }}
            placeholder="Nhập số tiền khách đưa..."
            disabled={submitting}
          />
          {cashError && (
            <div className="text-danger mt-1">{cashError}</div>
          )}
        </div>
        <div className="mb-3">
          <div className="d-flex justify-content-between mt-2">
            <span>Tiền thối lại:</span>
            <strong className="text-danger fs-5">
              {(() => {
                const received = parseVNNumber(cashReceived);
                if (received >= total) {
                  return toVNPrice(received - total);
                }
                return toVNPrice(0);
              })()}
            </strong>
          </div>
        </div>
      </>
    )
  }

  const bodySelectPayment = () => {
    return (
      <div className="d-grid gap-3">
        <button
          className="btn btn-outline-primary btn-lg py-3"
          onClick={() => processOrder("cash")}
          disabled={submitting}
        >
          <i className="bi bi-cash-coin me-2"></i>
          <strong>Tiền mặt</strong>
          <div className="small text-muted">Thanh toán trực tiếp tại cửa hàng</div>
        </button>
        <button
          className="btn btn-outline-success btn-lg py-3 btn-momo-custom"
          onClick={() => processOrder("online")}
          disabled={submitting}
        >
        <i className="bi bi-credit-card me-2"></i>
          <strong>Momo</strong>
          <div className="small text-muted">MoMo E-Wallet</div>
        </button>
      </div>
    )
  }

  return (!showPaymentModal) ? <></> : (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedPaymentMethod === "cash" ? "Thanh toán tiền mặt" : "Chọn phương thức thanh toán"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPaymentMethod("");
                }}
              />
            </div>
            <div className="modal-body">
              {selectedPaymentMethod === "cash" ? bodyCashPayment() : bodySelectPayment()}
              <div className="mt-3 p-3 bg-light rounded">
                <div className="d-flex justify-content-between mb-1">
                  <span>Tổng tiền:</span>
                  <strong className="text-primary fs-5">{toVNPrice(total)}</strong>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedPaymentMethod === "cash" ? (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedPaymentMethod("");
                    }}
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={confirmCashPayment}
                    disabled={submitting}
                  >
                    Xác nhận
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={submitting}
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentModal;