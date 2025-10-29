import axios from "axios";
import { useState, useEffect } from "react";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import "./Login.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState({
    id: "",
    password: ""
  });

  const [errors, setErrors] = useState({
    id: "",
    password: ""
  });

  const validateField = (key, val) => {
    let msg = "";

    if (key === "id") {
      if (!val.trim()) msg = "Vui lòng nhập mã người dùng!";
    }

    if (key === "password") {
      if (!val.trim()) msg = "Vui lòng nhập mật khẩu!";
    }

    setErrors(e => ({ ...e, [key]: msg }));
    return msg;
  }

  const validateAll = () => {
    const m = {
      id: validateField("id", user.id),
      password: validateField("password", user.password)
    };
    return Object.values(m).every(x => !x);
  }

  useEffect(() => { document.title = "Đăng nhập | Quản lý kho hàng " }, []);

  return (
    <main id="login">
      <form onSubmit={e => e.preventDefault()} className="needs-validation" noValidate>
        <h1 className="text-uppercase mb-4 text-center fw-bold h2">Đăng nhập</h1>
        
        <div className="mb-4">
          <label
            htmlFor="user-id"
            className="form-label fw-semibold"
          >
            ID người dùng:
          </label>
          <input
            id="user-id" type="text"
            placeholder="ID người dùng"
            className={`form-control ${errors.id ? "is-invalid" : ""}`}
            value={user.id}
            onChange={e => {
              setUser({...user, id: e.target.value});
              validateField("id", e.target.value);
            }}
          />
          <small className="invalid-feedback">{errors.id}</small>
        </div>

        <div className="mb-4">
          <label
            htmlFor="user-pass"
            className="form-label fw-semibold"
          >
            Mật khẩu:
          </label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="Mật khẩu" id="user-pass" value={user.password}
              onChange={e => {
                setUser({...user, password: e.target.value});
                validateField("password", e.target.value);
              }}
            />
            <button
              className="btn btn-secondary rounded-end"
              onClick={() => setShowPassword(!showPassword)}
            >
              { showPassword ? <EyeSlash size={24} /> : <Eye size={24} /> }
            </button>
            
            <small className="invalid-feedback">{errors.password}</small>
          </div>
          
        </div>

        <div className="text-center">
          <input
            type="submit"
            value="Đăng nhập"
            className="btn"
            onClick={handleLogin}
          />
        </div>
      </form>
    </main>
  )

  function handleLogin() {
    if (!validateAll()) return;

    /*
      TO DO: Fetch login bên admin và trả về StatusCode
      - 200: Đăng nhập thành công:
      - 400: Trả về kèm lỗi.
      StatusCode(400, new { key: val });
      Rồi sau đó setErrors cái lỗi.
    */

    /*
      Code tạm: Đăng nhập thành công
      Biến tạm: role.
    */
    alert("Đăng nhập thành công!");
    const role = "admin"; // Tạm thời: Sửa role thành staff để vô thanh toán
    location.href = (`/${role}`);
  }
}