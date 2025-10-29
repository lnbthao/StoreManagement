import axios from "axios";
import { useEffect, useState } from "react";
import { FloppyFill, XLg } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router-dom";

export default function AddUpUser({ status = false }) {
  const navTo = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [user, setUser] = useState({
    username: "",
    password: "", // update: có thể để trống
    fullName: "",
    role: "staff", // "admin" | "staff"
  });

  // lỗi inline theo field
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "",
  });

  useEffect(() => {
    document.title = `${
      status ? "Cập nhật" : "Thêm"
    } người dùng | Quản lý kho hàng`;
    if (status && id) {
      fetchData(id);
    } else {
      setLoading(false);
    }
  }, [status, id]);

  async function fetchData(userId) {
    try {
      // const { data } = await axios.get(`/api/user/${userId}`);
      // setUser({ username: data.username, password: "", fullName: data.fullName, role: data.role });
      setUser({
        username: "tranthu0711",
        password: "123123",
        fullName: "Trần Thị Thu",
        role: "admin",
      });
    } catch (e) {
      console.error(e);
      alert("Không tải được dữ liệu người dùng.");
    } finally {
      setLoading(false);
    }
  }

  const validateField = (key, value) => {
    let msg = "";

    if (key === "username") {
      if (!value.trim()) msg = "Vui lòng nhập username.";
      else if (value.length < 3) msg = "Username tối thiểu 3 ký tự.";
    }

    if (key === "password") {
      if (!status) {
        if (!value.trim()) msg = "Vui lòng nhập mật khẩu.";
        else if (value.length < 6) msg = "Mật khẩu tối thiểu 6 ký tự.";
      } else {
        // cập nhật: cho phép bỏ trống, nhưng nếu nhập thì >= 6
        if (value && value.length < 6) msg = "Mật khẩu tối thiểu 6 ký tự.";
      }
    }

    if (key === "fullName") {
      if (!value.trim()) msg = "Vui lòng nhập họ tên.";
    }

    if (key === "role") {
      if (!value) msg = "Vui lòng chọn vai trò.";
    }

    setErrors((e) => ({ ...e, [key]: msg }));
    return msg;
  };

  // validate toàn form
  const validateAll = () => {
    const e1 = validateField("username", user.username);
    const e2 = validateField("password", user.password);
    const e3 = validateField("fullName", user.fullName);
    const e4 = validateField("role", user.role);
    return !(e1 || e2 || e3 || e4);
  };

  const handleChange = (key) => (e) => {
    const val = e.target.value;
    setUser((u) => ({ ...u, [key]: val }));
  };

  const handleBlur = (key) => (e) => {
    validateField(key, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    alert(
      (status ? "Cập nhật -----" + id : "Thêm -----") +
        JSON.stringify(user, null, 2)
    );

    // try {
    //   setSubmitting(true);
    //   const payload = { ...user };
    //   if (status && !payload.password) delete payload.password;

    //   let res;
    //   if (status && id) {
    //     res = await axios.put(`/api/user/${id}`, payload, {
    //       headers: { "Content-Type": "application/json" },
    //     });
    //   } else {
    //     res = await axios.post(`/api/user`, payload, {
    //       headers: { "Content-Type": "application/json" },
    //     });
    //   }

    //   if (res.status === 200 || res.status === 201) {
    //     alert(`${status ? "Cập nhật" : "Thêm"} người dùng thành công!`);
    //     navTo("/admin/user", { replace: true });
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
        {status ? "Cập nhật" : "Thêm"} người dùng
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="user-username" className="d-block mb-1">
            Username:
          </label>
          <input
            id="user-username"
            className={`form-control ${
              errors.username ? "is-invalid" : ""
            } mb-1`}
            placeholder="Nhập username"
            type="text"
            value={user.username}
            onChange={handleChange("username")}
            onBlur={handleBlur("username")}
          />
          {errors.username && (
            <small className="text-danger">{errors.username}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="user-password" className="d-block mb-1">
            Mật khẩu{" "}
            {status && (
              <small className="text-muted">(bỏ trống nếu không đổi)</small>
            )}
            :
          </label>
          <input
            id="user-password"
            className={`form-control ${
              errors.password ? "is-invalid" : ""
            } mb-1`}
            placeholder={status ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
            type="password"
            value={user.password}
            onChange={handleChange("password")}
            onBlur={handleBlur("password")}
          />
          {errors.password && (
            <small className="text-danger">{errors.password}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="user-fullname" className="d-block mb-1">
            Họ tên:
          </label>
          <input
            id="user-fullname"
            className={`form-control ${
              errors.fullName ? "is-invalid" : ""
            } mb-1`}
            placeholder="Nhập họ tên"
            type="text"
            value={user.fullName}
            onChange={handleChange("fullName")}
            onBlur={handleBlur("fullName")}
          />
          {errors.fullName && (
            <small className="text-danger">{errors.fullName}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="user-role" className="d-block mb-1">
            Vai trò:
          </label>
          <select
            id="user-role"
            className={`form-control ${errors.role ? "is-invalid" : ""} mb-1`}
            value={user.role}
            onChange={handleChange("role")}
            onBlur={handleBlur("role")}
          >
            <option value="staff">staff</option>
            <option value="admin">admin</option>
          </select>
          {errors.role && <small className="text-danger">{errors.role}</small>}
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
            onClick={() => navTo("/admin/user", { replace: true })}
            className="btn btn-secondary"
          >
            <XLg size={20} className="me-1" /> Hủy bỏ
          </button>
        </div>
      </form>
    </>
  );
}
