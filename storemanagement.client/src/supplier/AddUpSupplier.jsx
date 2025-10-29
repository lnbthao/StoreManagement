import axios from "axios";
import { useState, useEffect } from "react";
import { FloppyFill, XLg } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router-dom";

export default function AddUpSupplier({ status = false }) {
  const navTo = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [supplier, setSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // Lỗi inline theo từng field
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    document.title = `${
      status ? "Cập nhật" : "Thêm"
    } nhà cung cấp | Quản lý kho hàng`;
    if (status && id) fetchData(id);
    else setLoading(false);
  }, [status, id]);

  async function fetchData(id) {
    try {
      // const { data } = await axios.get(`/api/supplier/${id}`);
      // setSupplier({ name: data.supplierName, phone: data.phone, email: data.email, address: data.address });
      setSupplier({
        name: "Công ty ABC",
        phone: "0909123456",
        email: "xyz@gmail.com",
        address: "Đà Nẵng",
      });
    } catch (e) {
      console.error(e);
      alert("Không tải được dữ liệu nhà cung cấp.");
    } finally {
      setLoading(false);
    }
  }

  // Validate 1 field
  const validateField = (key, val) => {
    let msg = "";
    if (key === "name") {
      if (!val.trim()) msg = "Vui lòng nhập tên nhà cung cấp.";
      else if (val.trim().length < 2) msg = "Tên tối thiểu 2 ký tự.";
    }
    if (key === "phone") {
      if (!val.trim()) msg = "Vui lòng nhập số điện thoại.";
      else if (!/^\d{9,11}$/.test(val.trim()))
        msg = "SĐT chỉ chứa số (9–11 chữ số).";
    }
    if (key === "email") {
      if (!val.trim()) msg = "Vui lòng nhập email.";
      else if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
        msg = "Email không hợp lệ.";
    }
    if (key === "address") {
      if (!val.trim()) msg = "Vui lòng nhập địa chỉ.";
    }
    setErrors((e) => ({ ...e, [key]: msg }));
    return msg;
  };

  // Validate toàn form
  const validateAll = () => {
    const m1 = validateField("name", supplier.supplierName);
    const m2 = validateField("phone", supplier.phone);
    const m3 = validateField("email", supplier.email);
    const m4 = validateField("address", supplier.address);
    return !(m1 || m2 || m3 || m4);
  };

  const handleChange = (key) => (e) => {
    const val = e.target.value;
    setSupplier((s) => ({ ...s, [key]: val }));
  };

  const handleBlur = (key) => (e) => {
    validateField(key, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    alert(
      (status ? "Cập nhật -----" + id : "Thêm -----") +
        JSON.stringify(supplier, null, 2)
    );

    // try {
    //   setSubmitting(true);
    //   let res;
    //   if (status && id) {
    //     res = await axios.put(`/api/supplier/${id}`, supplier, {
    //       headers: { "Content-Type": "application/json" },
    //     });
    //   } else {
    //     res = await axios.post(`/api/supplier`, supplier, {
    //       headers: { "Content-Type": "application/json" },
    //     });
    //   }

    //   if (res.status === 200 || res.status === 201) {
    //     alert(`${status ? "Cập nhật" : "Thêm"} nhà cung cấp thành công!`);
    //     navTo("/admin/supplier", { replace: true });
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
        {status ? "Cập nhật" : "Thêm"} nhà cung cấp
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="supplier-name" className="d-block mb-1">
            Tên nhà cung cấp:
          </label>
          <input
            id="supplier-name"
            className={`form-control ${errors.supplierName ? "is-invalid" : ""} mb-1`}
            placeholder="Nhập tên nhà cung cấp"
            type="text"
            value={supplier.supplierName}
            onChange={handleChange("name")}
            onBlur={handleBlur("name")}
          />
          {errors.supplierName && <small className="text-danger">{errors.supplierName}</small>}
        </div>

        <div className="mt-3">
          <label htmlFor="supplier-phone" className="d-block mb-1">
            Điện thoại:
          </label>
          <input
            id="supplier-phone"
            className={`form-control ${errors.phone ? "is-invalid" : ""} mb-1`}
            placeholder="Nhập số điện thoại"
            type="tel"
            value={supplier.phone}
            onChange={handleChange("phone")}
            onBlur={handleBlur("phone")}
          />
          {errors.phone && (
            <small className="text-danger">{errors.phone}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="supplier-email" className="d-block mb-1">
            Email:
          </label>
          <input
            id="supplier-email"
            className={`form-control ${errors.email ? "is-invalid" : ""} mb-1`}
            placeholder="Nhập email"
            type="email"
            value={supplier.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
          />
          {errors.email && (
            <small className="text-danger">{errors.email}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="supplier-address" className="d-block mb-1">
            Địa chỉ:
          </label>
          <input
            id="supplier-address"
            className={`form-control ${
              errors.address ? "is-invalid" : ""
            } mb-1`}
            placeholder="Nhập địa chỉ"
            type="text"
            value={supplier.address}
            onChange={handleChange("address")}
            onBlur={handleBlur("address")}
          />
          {errors.address && (
            <small className="text-danger">{errors.address}</small>
          )}
        </div>

        <div className="d-flex justify-content-center column-gap-2 mt-4">
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
            onClick={() => navTo("/admin/supplier", { replace: true })}
            className="btn btn-secondary"
          >
            <XLg size={20} className="me-1" /> Hủy bỏ
          </button>
        </div>
      </form>
    </>
  );
}
