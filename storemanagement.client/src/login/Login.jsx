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

    // Gọi API đăng nhập
    axios.post("/api/user/login", {
      username: user.id,
      password: user.password
    })
    .then(response => {
      const data = response.data;
      
      // Lưu thông tin user vào localStorage
      const userData = {
        userId: data.userId,
        username: data.username,
        fullName: data.fullName,
        role: data.role,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem("currentUser", JSON.stringify(userData));
      
      alert(data.message || "Đăng nhập thành công!");
      
      // Chuyển hướng theo role
      if (data.role === "admin") {
        location.href = "/admin";
      } else if (data.role === "staff") {
        location.href = "/staff";
      } else {
        location.href = "/admin"; // Mặc định
      }
    })
    .catch(error => {
      console.error("Login error:", error);
      
      if (error.response) {
        // Server trả về lỗi
        const message = error.response.data?.message || "Đăng nhập thất bại!";
        alert(message);
        
        if (error.response.status === 401) {
          // Unauthorized - sai username hoặc password
          if (message.includes("không tồn tại")) {
            setErrors(e => ({ ...e, id: message }));
          } else if (message.includes("không đúng")) {
            setErrors(e => ({ ...e, password: message }));
          }
        }
      } else {
        // Lỗi network hoặc server không phản hồi
        alert("Không thể kết nối đến server. Vui lòng kiểm tra lại!");
      }
    });
  }
}