import axios from "axios";
import { useEffect, useState } from "react";
import { FloppyFill, XLg } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router-dom";

export default function AddUpPromotion({ status = false }) {
  const navTo = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [promo, setPromo] = useState({
    promoCode: "",
    description: "",
    discountType: "percent", // "percent" | "fixed"
    discountValue: 0, // % nếu percent, VND nếu fixed
    startDate: "", // YYYY-MM-DD
    endDate: "", // YYYY-MM-DD
    minOrderAmount: 0, // VND
    usageLimit: 0, // 0 = không giới hạn
    status: "active", // "active" | "inactive"
  });

  const [errors, setErrors] = useState({
    promoCode: "",
    description: "",
    discountType: "",
    discountValue: "",
    startDate: "",
    endDate: "",
    minOrderAmount: "",
    usageLimit: "",
    status: "",
  });

  useEffect(() => {
    document.title = `${
      status ? "Cập nhật" : "Thêm"
    } khuyến mãi | Quản lý kho hàng`;
    if (status && id) {
      fetchData(id);
    } else {
      setLoading(false);
    }
  }, [status, id]);

  async function fetchData(promoId) {
    try {
      // const { data } = await axios.get(`/api/promotion/${promoId}`);
      // setPromo(data); // nhớ map field nếu API là snake_case
      const data = {
        promoCode: "SALE10",
        description: "Giảm 10% cho tất cả đơn hàng",
        discountType: "percent",
        discountValue: 10,
        startDate: "2025-10-01",
        endDate: "2025-12-31",
        minOrderAmount: 0,
        usageLimit: 0,
        status: "active",
      };
      setPromo(data);
    } catch (e) {
      console.error(e);
      alert("Không tải được dữ liệu khuyến mãi.");
    } finally {
      setLoading(false);
    }
  }

  const setField = (key) => (e) => {
    const val = e.target.value;
    setPromo((p) => ({ ...p, [key]: val }));
  };

  const validateField = (key, value, draft = promo) => {
    let msg = "";

    if (key === "promoCode") {
      if (!value.trim()) msg = "Vui lòng nhập mã khuyến mãi.";
      else if (value.length < 3) msg = "Mã tối thiểu 3 ký tự.";
    }

    if (key === "description") {
      if (!value.trim()) msg = "Vui lòng nhập mô tả.";
    }

    if (key === "discountType") {
      if (!value) msg = "Vui lòng chọn loại giảm.";
    }

    if (key === "discountValue") {
      const v = Number(value);
      if (!Number.isFinite(v) || v <= 0) msg = "Giá trị giảm phải > 0.";
      else if (draft.discountType === "percent" && v > 100) {
        msg = "Phần trăm tối đa là 100.";
      }
    }

    if (key === "startDate") {
      if (!value) msg = "Vui lòng chọn ngày bắt đầu.";
      else if (draft.endDate && value > draft.endDate) {
        msg = "Ngày bắt đầu không được sau ngày kết thúc.";
      }
    }

    if (key === "endDate") {
      if (!value) msg = "Vui lòng chọn ngày kết thúc.";
      else if (draft.startDate && value < draft.startDate) {
        msg = "Ngày kết thúc phải ≥ ngày bắt đầu.";
      }
    }

    if (key === "minOrderAmount") {
      const v = Number(value);
      if (!Number.isFinite(v) || v < 0) msg = "Đơn tối thiểu phải ≥ 0.";
    }

    if (key === "usageLimit") {
      const v = Number(value);
      if (!Number.isFinite(v) || v < 0) msg = "Giới hạn lượt dùng phải ≥ 0.";
    }

    if (key === "status") {
      if (!value) msg = "Vui lòng chọn trạng thái.";
    }

    setErrors((e) => ({ ...e, [key]: msg }));
    return msg;
  };

  const handleBlur = (key) => (e) => {
    const val = e.target.value;
    const draft = { ...promo, [key]: val };
    validateField(key, val, draft);
    if (key === "startDate" && draft.endDate)
      validateField("endDate", draft.endDate, draft);
    if (key === "endDate" && draft.startDate)
      validateField("startDate", draft.startDate, draft);
  };

  const validateAll = () => {
    const draft = { ...promo };
    const m = {
      promoCode: validateField("promoCode", draft.promoCode, draft),
      description: validateField("description", draft.description, draft),
      discountType: validateField("discountType", draft.discountType, draft),
      discountValue: validateField("discountValue", draft.discountValue, draft),
      startDate: validateField("startDate", draft.startDate, draft),
      endDate: validateField("endDate", draft.endDate, draft),
      minOrderAmount: validateField(
        "minOrderAmount",
        draft.minOrderAmount,
        draft
      ),
      usageLimit: validateField("usageLimit", draft.usageLimit, draft),
      status: validateField("status", draft.status, draft),
    };
    return Object.values(m).every((x) => !x);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    alert(
      (status ? "Cập nhật -----" + id : "Thêm -----") +
        JSON.stringify(promo, null, 2)
    );

    // try {
    //   setSubmitting(true);
    //   const payload = {
    //     ...promo,
    //     discountValue: Number(promo.discountValue),
    //     minOrderAmount: Number(promo.minOrderAmount || 0),
    //     usageLimit: Number(promo.usageLimit || 0),
    //   };

    //   let res;
    //   if (status && id) {
    //     res = await axios.put(`/api/promotion/${id}`, payload, {
    //       headers: { "Content-Type": "application/json" },
    //     });
    //   } else {
    //     res = await axios.post(`/api/promotion`, payload, {
    //       headers: { "Content-Type": "application/json" },
    //     });
    //   }

    //   if (res.status === 200 || res.status === 201) {
    //     alert(`${status ? "Cập nhật" : "Thêm"} khuyến mãi thành công!`);
    //     navTo("/admin/promotion", { replace: true });
    //   } else {
    //     alert(`${status ? "Cập nhật" : "Thêm"} thất bại!`);
    //     console.error(res);
    //   }
    // } catch (err) {
    //   alert(`${status ? "Cập nhật" : "Thêm"} thất bại!`);
    //   console.error(err);
    // } finally {
    //   setSubmitting(false);
    // }
  };

  if (loading) return null;

  return (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">
        {status ? "Cập nhật" : "Thêm"} khuyến mãi
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="promo-code" className="d-block mb-1">
            Mã khuyến mãi:
          </label>
          <input
            id="promo-code"
            className={`form-control ${
              errors.promoCode ? "is-invalid" : ""
            } mb-1`}
            placeholder="Ví dụ: SALE10"
            type="text"
            value={promo.promoCode}
            onChange={setField("promoCode")}
            onBlur={handleBlur("promoCode")}
          />
          {errors.promoCode && (
            <small className="text-danger">{errors.promoCode}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="promo-desc" className="d-block mb-1">
            Mô tả:
          </label>
          <textarea
            id="promo-desc"
            className={`form-control ${
              errors.description ? "is-invalid" : ""
            } mb-1`}
            placeholder="Mô tả khuyến mãi"
            rows={3}
            value={promo.description}
            onChange={setField("description")}
            onBlur={handleBlur("description")}
          />
          {errors.description && (
            <small className="text-danger">{errors.description}</small>
          )}
        </div>

        <div className="row g-3 mt-1 mb-3">
          <div className="col-md-4">
            <label className="d-block mb-1">Loại giảm:</label>
            <select
              className={`form-control ${
                errors.discountType ? "is-invalid" : ""
              } mb-1`}
              value={promo.discountType}
              onChange={setField("discountType")}
              onBlur={handleBlur("discountType")}
            >
              <option value="percent">percent (%)</option>
              <option value="fixed">fixed (VND)</option>
            </select>
            {errors.discountType && (
              <small className="text-danger">{errors.discountType}</small>
            )}
          </div>

          <div className="col-md-4">
            <label className="d-block mb-1">Giá trị giảm:</label>
            <input
              className={`form-control ${
                errors.discountValue ? "is-invalid" : ""
              } mb-1`}
              type="number"
              min="0"
              step="1"
              value={promo.discountValue}
              onChange={setField("discountValue")}
              onBlur={handleBlur("discountValue")}
              placeholder={
                promo.discountType === "percent" ? "Ví dụ: 10" : "Ví dụ: 50000"
              }
            />
            {errors.discountValue && (
              <small className="text-danger">{errors.discountValue}</small>
            )}
          </div>

          <div className="col-md-4">
            <label className="d-block mb-1">Trạng thái:</label>
            <select
              className={`form-control ${
                errors.status ? "is-invalid" : ""
              } mb-1`}
              value={promo.status}
              onChange={setField("status")}
              onBlur={handleBlur("status")}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
            {errors.status && (
              <small className="text-danger">{errors.status}</small>
            )}
          </div>
        </div>

        <div className="row g-3 mt-1 mb-3">
          <div className="col-md-6">
            <label className="d-block mb-1">Ngày bắt đầu:</label>
            <input
              className={`form-control ${
                errors.startDate ? "is-invalid" : ""
              } mb-1`}
              type="date"
              value={promo.startDate}
              onChange={setField("startDate")}
              onBlur={handleBlur("startDate")}
            />
            {errors.startDate && (
              <small className="text-danger">{errors.startDate}</small>
            )}
          </div>
          <div className="col-md-6">
            <label className="d-block mb-1">Ngày kết thúc:</label>
            <input
              className={`form-control ${
                errors.endDate ? "is-invalid" : ""
              } mb-1`}
              type="date"
              value={promo.endDate}
              onChange={setField("endDate")}
              onBlur={handleBlur("endDate")}
            />
            {errors.endDate && (
              <small className="text-danger">{errors.endDate}</small>
            )}
          </div>
        </div>

        <div className="row g-3 mt-1 mb-4">
          <div className="col-md-6">
            <label className="d-block mb-1">Đơn tối thiểu (VND):</label>
            <input
              className={`form-control ${
                errors.minOrderAmount ? "is-invalid" : ""
              } mb-1`}
              type="number"
              min="0"
              step="1000"
              value={promo.minOrderAmount}
              onChange={setField("minOrderAmount")}
              onBlur={handleBlur("minOrderAmount")}
            />
            {errors.minOrderAmount && (
              <small className="text-danger">{errors.minOrderAmount}</small>
            )}
          </div>
          <div className="col-md-6">
            <label className="d-block mb-1">
              Giới hạn lượt dùng (0 = không giới hạn):
            </label>
            <input
              className={`form-control ${
                errors.usageLimit ? "is-invalid" : ""
              } mb-1`}
              type="number"
              min="0"
              step="1"
              value={promo.usageLimit}
              onChange={setField("usageLimit")}
              onBlur={handleBlur("usageLimit")}
            />
            {errors.usageLimit && (
              <small className="text-danger">{errors.usageLimit}</small>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-center column-gap-2">
          <button
            type="submit"
            className="btn btn-success"
            disabled={submitting}
          >
            <FloppyFill size={20} className="me-1" />{" "}
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>

          <button
            type="button"
            onClick={() => navTo("/admin/promotion", { replace: true })}
            className="btn btn-secondary"
          >
            <XLg size={20} className="me-1" /> Hủy bỏ
          </button>
        </div>
      </form>
    </>
  );
}
