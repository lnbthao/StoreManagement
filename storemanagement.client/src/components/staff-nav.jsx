import { useNavigate, useLocation } from "react-router-dom";
import "./staff-nav.css";

const StaffNav = () => {
  const navTo = useNavigate();
  const pathname = useLocation().pathname;

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("currentUser");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  };
  const currentUser = getCurrentUser();

  return (
    <header className="d-flex justify-content-between align-items-center bg-dark py-1 text-white">
      <nav>
        <button
          className={`btn btn-dark border border-0 ${pathname === "/staff" ? "fw-semibold" : ""}`}
          onClick={() => navTo("/staff")}
        >
          Thanh toán
        </button>
        <button
          className={`btn btn-dark border border-0 ${pathname === "/staff/order" ? "fw-semibold" : ""}`}
          onClick={() => navTo("/staff/order")}
        >
          Đơn hàng
        </button>
      </nav>

      <div className="me-3 text-end">
        <p className="my-1 fw-bold fst-italic h5">Xin chào, {currentUser?.fullName || "nhân viên"}!</p>

        <a onClick={handleLogout}>
          <i className="bi bi-box-arrow-in-right"></i> Đăng xuất
        </a>
      </div>
    </header>
  )

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navTo("/");
  }
}

export { StaffNav }