import axios from "axios";
import { useEffect, useState } from "react";
import { FloppyFill, XLg } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router-dom";

export default function AddUpPromotion({ status = false }) {
  const navTo = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // FE STATE — bao gồm cả usedCount để tránh bị null khi PUT
  const [promo, setPromo] = useState({
    promoCode: "",
    description: "",
    discountType: "percent",
    discountValue: 0,
    startDate: "",
    endDate: "",
    minOrderAmount: 0,
    usageLimit: -1,
    usedCount: 0, // ⭐ THÊM GIỮ CHỖ
    status: "active",
  });

  const [errors, setErrors] = useState({});

  // MAP API → FE
  const mapFromApi = (p) => ({
    promoCode: p.promoCode || "",
    description: p.description || "",
    discountType: p.discountType || "percent",
    discountValue: p.discountValue ?? 0,
    startDate: p.startDate ? p.startDate.substring(0, 10) : "",
    endDate: p.endDate ? p.endDate.substring(0, 10) : "",
    minOrderAmount: p.minOrderAmount ?? 0,
    usageLimit: p.usageLimit ?? -1,
    usedCount: p.usedCount ?? 0, // ⭐ THÊM ĐỂ PUT KHÔNG BỊ MẤT DỮ LIỆU
    status: p.status || "active",
  });

  // MAP FE → API
  const mapToApi = (p) => ({
    promoId: Number(id) || 0,
    promoCode: p.promoCode,
    description: p.description,
    discountType: p.discountType,
    discountValue: Number(p.discountValue),
    startDate: p.startDate,
    endDate: p.endDate,
    minOrderAmount: Number(p.minOrderAmount),
    usageLimit: Number(p.usageLimit),
    usedCount: Number(p.usedCount), // ⭐ BẮT BUỘC GỬI LÊN API
    status: p.status,
  });

  // LOAD DATA EDIT
  useEffect(() => {
    document.title = `${status ? "Cập nhật" : "Thêm"} khuyến mãi`;

    if (!status || !id) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await axios.get(`/api/promotion/${id}`);
        setPromo(mapFromApi(data));
      } catch (err) {
        alert("Không thể tải dữ liệu!");
        navTo("/admin/promotion");
      } finally {
        setLoading(false);
      }
    })();
  }, [status, id]);

  // HANDLE CHANGE
  const setField = (key) => (e) =>
    setPromo((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

  // VALIDATION
  const validateField = (key, value, draft) => {
    let msg = "";

    switch (key) {
      case "promoCode":
        if (!value.trim()) msg = "Vui lòng nhập mã khuyến mãi.";
        break;

      case "description":
        if (!value.trim()) msg = "Vui lòng nhập mô tả.";
        break;

      case "discountValue":
        if (value <= 0) msg = "Giá trị giảm phải > 0";
        if (draft.discountType === "percent" && value > 100)
          msg = "Phần trăm tối đa 100%";
        break;

      case "startDate":
        if (!value) msg = "Chọn ngày bắt đầu";
        else if (draft.endDate && value > draft.endDate)
          msg = "Ngày bắt đầu phải trước ngày kết thúc";
        break;

      case "endDate":
        if (!value) msg = "Chọn ngày kết thúc";
        else if (draft.startDate && value < draft.startDate)
          msg = "Ngày kết thúc phải ≥ ngày bắt đầu";
        break;
    }

    return msg;
  };

  const validateAll = () => {
    const draft = { ...promo };
    const newErr = {};

    Object.keys(draft).forEach((k) => {
      newErr[k] = validateField(k, draft[k], draft);
    });

    setErrors(newErr);
    return Object.values(newErr).every((x) => !x);
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      setSubmitting(true);

      const payload = mapToApi(promo);
      let res;

      if (status)
        res = await axios.put(`/api/promotion/${id}`, payload);
      else
        res = await axios.post(`/api/promotion`, payload);

      alert(`${status ? "Cập nhật" : "Thêm"} thành công!`);
      navTo("/admin/promotion", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  // UI
  return (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">
        {status ? "Cập nhật" : "Thêm"} khuyến mãi
      </h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Mã khuyến mãi</label>
          <input
            className={`form-control ${errors.promoCode ? "is-invalid" : ""}`}
            value={promo.promoCode}
            onChange={setField("promoCode")}
            placeholder="Nhập mã khuyến mãi"
          />
          <small className="text-danger">{errors.promoCode}</small>
        </div>

        <div className="mt-3">
          <label>Mô tả</label>
          <textarea
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            value={promo.description}
            onChange={setField("description")}
            placeholder="Nhập mô tả"
          />
          <small className="text-danger">{errors.description}</small>
        </div>

        <div className="row mt-3">
          <div className="col-md-4">
            <label>Loại giảm</label>
            <select
              className="form-control"
              value={promo.discountType}
              onChange={setField("discountType")}
            >
              <option value="percent">percent (%)</option>
              <option value="fixed">fixed (VND)</option>
            </select>
          </div>

          <div className="col-md-4">
            <label>Giá trị giảm</label>
            <input
              type="number"
              className={`form-control ${errors.discountValue ? "is-invalid" : ""}`}
              value={promo.discountValue}
              onChange={setField("discountValue")}
            />
            <small className="text-danger">{errors.discountValue}</small>
          </div>

          <div className="col-md-4">
            <label>Trạng thái</label>
            <select
              className="form-control"
              value={promo.status}
              onChange={setField("status")}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-6">
            <label>Ngày bắt đầu</label>
            <input
              type="date"
              className={`form-control ${errors.startDate ? "is-invalid" : ""}`}
              value={promo.startDate}
              onChange={setField("startDate")}
            />
            <small className="text-danger">{errors.startDate}</small>
          </div>

          <div className="col-md-6">
            <label>Ngày kết thúc</label>
            <input
              type="date"
              className={`form-control ${errors.endDate ? "is-invalid" : ""}`}
              value={promo.endDate}
              onChange={setField("endDate")}
            />
            <small className="text-danger">{errors.endDate}</small>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-6">
            <label>Đơn tối thiểu</label>
            <input
              type="number"
              className="form-control"
              value={promo.minOrderAmount}
              onChange={setField("minOrderAmount")}
            />
          </div>

          <div className="col-md-6">
            <label>Giới hạn (-1 = không giới hạn)</label>
            <input
              type="number"
              className="form-control"
              value={promo.usageLimit}
              onChange={setField("usageLimit")}
            />
          </div>
        </div>

        <div className="d-flex justify-content-center gap-2 mt-4">
          <button className="btn btn-success" disabled={submitting}>
            <FloppyFill size={20} className="me-1" />
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navTo("/admin/promotion")}
          >
            <XLg className="me-1" /> Hủy
          </button>
        </div>
      </form>
    </>
  );
}
