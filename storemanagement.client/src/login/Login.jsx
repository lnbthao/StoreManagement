import axios from "axios";
import { useState, useEffect } from "react";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navTo = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState({
    username: "",
    password: ""
  });

  const [errors, setErrors] = useState({
    username: "",
    password: ""
  });

  const validateField = (key, val) => {
    let msg = "";

    if (key === "username") {
      if (!val.trim()) msg = "Vui lòng nhập tên đăng nhập!";
    }

    if (key === "password") {
      if (!val.trim()) msg = "Vui lòng nhập mật khẩu!";
    }

    setErrors(e => ({ ...e, [key]: msg }));
    return msg;
  }

  const validateAll = () => {
    const m = {
      id: validateField("username", user.username),
      password: validateField("password", user.password)
    };
    return Object.values(m).every(x => !x);
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      navTo(`/${user.role}`);
    }
    document.title = "Đăng nhập | Quản lý kho hàng "
  }, []);

  return (
    <main id="login">
      <form onSubmit={e => e.preventDefault()} className="needs-validation" noValidate>
        <h1 className="text-uppercase mb-4 text-center fw-bold h2">Đăng nhập</h1>
        
        <div className="mb-4">
          <label
            htmlFor="user-username"
            className="form-label fw-semibold"
          >
            Tên đăng nhập:
          </label>
          <input
            id="user-username" type="text"
            placeholder="Tên đăng nhập"
            className={`form-control ${errors.username ? "is-invalid" : ""}`}
            value={user.username}
            onChange={e => {
              setUser({...user, username: e.target.value});
              validateField("username", e.target.value);
            }}
          />
          <small className="invalid-feedback d-block">{errors.username}</small>
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
              placeholder="Mật khẩu" 
              id="user-pass" 
              value={user.password}
              onChange={e => {
                setUser({...user, password: e.target.value});
                validateField("password", e.target.value);
              }}
              onKeyDown={(e) => { 
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLogin();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-secondary rounded-end"
              onClick={() => setShowPassword(!showPassword)}
            >
              { showPassword ? <EyeSlash size={24} /> : <Eye size={24} /> }
            </button>
          </div>
          <small className="invalid-feedback d-block">{errors.password}</small>
        </div>

        <div className="text-center">
          <button
            type="button"
            className="btn btn-primary fw-semibold rounded-3"
            onClick={handleLogin}
          >
            Đăng nhập
          </button>
        </div>
      </form>
    </main>
  )

  async function handleLogin() {
    if (!validateAll()) return;
    try {
      const res = await axios.post('/api/user/login', {
        username: user.username,
        password: user.password
      }, { headers: { 'Content-Type': 'application/json' }});

      if (res.status === 200 && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('currentUser', JSON.stringify(res.data.user));
        const role = res.data?.user?.role;
        navTo(`/${role}`);
      } else {
        alert('Đăng nhập thất bại!');
      }
    } catch (err) {
      const errData = err?.response?.data || { message: 'Sai thông tin đăng nhập!', input: "username,password" };
      const newError = { username: "", password: "" }
      if (errData.input.includes("username")) newError.username = errData.message;
      if (errData.input.includes("password")) newError.password = errData.message;
      
      setErrors(newError);
    }
  }
}
