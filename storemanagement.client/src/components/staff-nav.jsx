import { useNavigate, useLocation } from "react-router-dom";
import "./staff-nav.css";

const StaffNav = () => {
  const navTo = useNavigate();
  const pathname = useLocation().pathname;

  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const fullName = user.fullName || "Người dùng";

  return (
    <header className="d-flex justify-content-between align-items-center bg-primary-subtle py-1">
      <nav>
        <button
          className={`btn btn-primary-subtle border border-0${
            pathname === "/staff" ? " text-primary link-underline-primary" : ""
          }`}
          onClick={() => navTo("/staff")}
        >
          Thanh toán
        </button>

        <button
          className={`btn btn-primary-subtle border border-0${
            pathname === "/staff/order" ? " text-primary link-underline-primary" : ""
          }`}
          onClick={() => navTo("/staff/order")}
        >
          Đơn hàng
        </button>
      </nav>

      <div className="me-3 text-end">
        <p className="my-1 fw-bold fst-italic h5">Xin chào, {fullName}!</p>

        <a onClick={handleLogout} style={{ cursor: "pointer" }}>
          <i className="bi bi-box-arrow-in-right"></i> Đăng xuất
        </a>
      </div>
    </header>
  );

  function handleLogout() {
    // Xóa user trong localStorage
    localStorage.removeItem("user");

    navTo("/");
  }
};

export { StaffNav };
