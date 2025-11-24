import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FloppyFill, XLg } from "react-bootstrap-icons";

export default function AddUpSupplier() {
  const navTo = useNavigate();
  const { id } = useParams();
  const isUpdateMode = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const keyList = [
    { key: "name", title: "tên nhà cung cấp" },
    { key: "phone", title: "số điện thoại" },
    { key: "email", title: "email" },
    { key: "address", title: "địa chỉ" },
  ];

  const [supplier, setSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // Load dữ liệu khi edit
  useEffect(() => {
    document.title = `${isUpdateMode ? "Cập nhật" : "Thêm"} nhà cung cấp | Quản lý kho hàng`;
    if (isUpdateMode) fetchData(id);
    else setLoading(false);
  }, [id]);

  async function fetchData(id) {
    try {
      const { data } = await axios.get(`/api/supplier/${id}`);
      setSupplier({
        name: data.supplierName,
        phone: data.phone,
        email: data.email,
        address: data.address,
      });
    } catch (err) {
      console.error(err);
      alert("Không tải được dữ liệu nhà cung cấp.");
    } finally {
      setLoading(false);
    }
  }

  const validateField = (key, val) => {
    let msg = "";
    if (key === "name") {
      if (!val.trim()) msg = "Vui lòng nhập tên nhà cung cấp.";
      else if (val.trim().length < 2) msg = "Tên tối thiểu 2 ký tự.";
    }
    if (key === "phone") {
      if (!val.trim()) msg = "Vui lòng nhập số điện thoại.";
      else if (!/^\d{10,11}$/.test(val.trim())) msg = "SĐT chỉ chứa số (10–11 chữ số).";
    }
    if (key === "email") {
      if (!val.trim()) msg = "Vui lòng nhập email.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = "Email không hợp lệ.";
    }
    if (key === "address") {
      if (!val.trim()) msg = "Vui lòng nhập địa chỉ.";
    }
    setErrors((e) => ({ ...e, [key]: msg }));
    return msg;
  };

  const validateAll = () => {
    const m1 = validateField("name", supplier.name);
    const m2 = validateField("phone", supplier.phone);
    const m3 = validateField("email", supplier.email);
    const m4 = validateField("address", supplier.address);
    return !(m1 || m2 || m3 || m4);
  };

  const handleChange = (key) => (e) => {
    setSupplier((s) => ({ ...s, [key]: e.target.value }));
  };

  const handleBlur = (key) => (e) => validateField(key, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      setSubmitting(true);
      let payload = {
        SupplierName: supplier.name,
        Phone: supplier.phone,
        Email: supplier.email,
        Address: supplier.address,
        IsActive: true,
      };

      let res;
      if (isUpdateMode) {
        res = await axios.put(`/api/supplier/${id}`, payload);
      } else {
        res = await axios.post(`/api/supplier`, payload);
      }

      if (res.status === 200 || res.status === 201) {
        alert(`${isUpdateMode ? "Cập nhật" : "Thêm"} nhà cung cấp thành công!`);
        navTo("/admin/supplier", { replace: true });
      } else {
        alert(`${isUpdateMode ? "Cập nhật" : "Thêm"} thất bại!`);
        console.error(res);
      }
    } catch (err) {
      alert(`${isUpdateMode ? "Cập nhật" : "Thêm"} thất bại!`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">
        {isUpdateMode ? "Cập nhật" : "Thêm"} nhà cung cấp
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        {keyList.map((key) => (
          <div className="mt-3" key={key.key}>
            <label htmlFor={`supplier-${key.key}`} className="d-block mb-1">
              {key.title.charAt(0).toUpperCase() + key.title.slice(1) + ":"}
            </label>
            <input
              id={`supplier-${key.key}`}
              className={`form-control ${errors[key.key] ? "is-invalid" : ""} mb-1`}
              placeholder={`Nhập ${key.title}`}
              type={key.key === "email" ? "email" : "text"}
              value={supplier[key.key] || ""}
              onChange={handleChange(key.key)}
              onBlur={handleBlur(key.key)}
            />
            {errors[key.key] && <small className="text-danger">{errors[key.key]}</small>}
          </div>
        ))}

        <div className="d-flex justify-content-center column-gap-2 mt-4">
          <button type="submit" className="btn btn-success" disabled={submitting}>
            <FloppyFill size={20} className="me-1" /> {submitting ? "Đang lưu..." : "Lưu"}
          </button>

          <button type="button" onClick={() => navTo("/admin/supplier", { replace: true })} className="btn btn-secondary">
            <XLg size={20} className="me-1" /> Hủy bỏ
          </button>
        </div>
      </form>
    </>
  );
}
