import axios from "axios";
import { useEffect, useState } from "react";
import { FloppyFill, XLg } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router-dom";

export default function AddUpCustomer({ status = false }) {
  const navTo = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [customer, setCustomer] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
  });

  // lỗi theo field
  const [errors, setErrors] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
  });

  const validateField = (key, val) => {
    let msg = "";
    if (key === "customerName") {
      if (!val.trim()) msg = "Vui lòng nhập tên khách hàng.";
    }
    if (key === "phone") {
      if (!val.trim()) msg = "Vui lòng nhập số điện thoại.";
      else if (!/^\d{10,11}$/.test(val)) msg = "SĐT chỉ chứa số (10–11 chữ số).";
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

  const validateAll = () => {
    const m1 = validateField("customerName", customer.customerName);
    const m2 = validateField("phone", customer.phone);
    const m3 = validateField("email", customer.email);
    const m4 = validateField("address", customer.address);
    return !(m1 || m2 || m3 || m4);
  };

  useEffect(() => {
    document.title = `${
      status ? "Cập nhật" : "Thêm"
    } khách hàng | Quản lý kho hàng`;
    if (status && id) {
      fetchData(id);
    } else {
      setLoading(false);
    }
  }, [status, id]);

  async function fetchData(id) {
    try {
      const { data } = await axios.get(`/api/customer/${id}`);
      setCustomer({ customerName: data.customerName, phone: data.phone, email: data.email, address: data.address });
    } catch (e) {
      console.error(e);
      alert("Không tải được dữ liệu khách hàng.");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (key) => (e) => {
    const val = e.target.value;
    setCustomer((c) => ({ ...c, [key]: val }));
  };

  const handleBlur = (key) => (e) => {
    validateField(key, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    
    try {
      setSubmitting(true);
      let res;
      if (status && id) {
        res = await axios.put(`/api/customer/${id}`, customer, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        res = await axios.post(`/api/customer`, customer, {
          headers: { "Content-Type": "application/json" },
        });
      }
      if (res.status === 200 || res.status === 201) {
        alert(`${status ? "Cập nhật" : "Thêm"} khách hàng thành công!`);
        navTo("/admin/customer", { replace: true });
      } else {
        alert(`${status ? "Cập nhật" : "Thêm"} thất bại!`);
        console.error(res);
      }
    } catch (err) {
      alert(`${status ? "Cập nhật" : "Thêm"} thất bại!`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">
        {status ? "Cập nhật" : "Thêm"} khách hàng
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="cus-customerName" className="d-block mb-1">
            Tên khách hàng:
          </label>
          <input
            id="cus-name"
            className={`form-control ${errors.customerName ? "is-invalid" : ""} mb-1`}
            placeholder="Nhập tên khách hàng"
            type="text"
            value={customer.customerName}
            onChange={handleChange("customerName")}
            onBlur={handleBlur("customerName")}
          />
          {errors.customerName && <small className="text-danger">{errors.customerName}</small>}
        </div>

        <div className="mt-3">
          <label htmlFor="cus-phone" className="d-block mb-1">
            Điện thoại:
          </label>
          <input
            id="cus-phone"
            className={`form-control ${errors.phone ? "is-invalid" : ""} mb-1`}
            placeholder="Nhập số điện thoại"
            type="tel"
            value={customer.phone}
            onChange={handleChange("phone")}
            onBlur={handleBlur("phone")}
          />
          {errors.phone && (
            <small className="text-danger">{errors.phone}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="cus-email" className="d-block mb-1">
            Email:
          </label>
          <input
            id="cus-email"
            className={`form-control ${errors.email ? "is-invalid" : ""} mb-1`}
            placeholder="Nhập email"
            type="email"
            value={customer.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
          />
          {errors.email && (
            <small className="text-danger">{errors.email}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="cus-address" className="d-block mb-1">
            Địa chỉ:
          </label>
          <input
            id="cus-address"
            className={`form-control ${
              errors.address ? "is-invalid" : ""
            } mb-1`}
            placeholder="Nhập địa chỉ"
            type="text"
            value={customer.address}
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
            onClick={() => navTo("/admin/customer", { replace: true })}
            className="btn btn-secondary"
          >
            <XLg size={20} className="me-1" /> Hủy bỏ
          </button>
        </div>
      </form>
    </>
  );
}
