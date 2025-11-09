import { useNavigate, useLocation } from "react-router-dom";
import "./nav.css";

const navList = [
  { key: "dashboard", name: "Thống kê", icon: "bi-pie-chart-fill", href: "/admin" },
  { key: "supplier", name: "Nhà cung cấp", icon: "bi-receipt-cutoff", href: "/admin/supplier" },
  { key: "category", name: "Loại sản phẩm", icon: "bi-box-seam-fill", href: "/admin/category" },
  { key: "product", name: "Sản phẩm", icon: "bi-pie-chart-fill", href: "/admin/product" },
  { key: "promotion", name: "Mã khuyến mãi", icon: "bi-graph-down-arrow", href: "/admin/promotion" },
  { key: "order", name: "Đơn hàng", icon: "bi-cart-fill", href: "/admin/order" },
  { key: "user", name: "Người dùng", icon: "bi-person-fill", href: "/admin/user" },
  { key: "customer", name: "Khách hàng", icon: "bi-wallet-fill", href: "/admin/customer" }
]

const SideNav = () => {
  const navTo = useNavigate();
  const pathname = useLocation().pathname;
  
  // Lấy thông tin user từ localStorage
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
    <header className="bg-dark vh-100">
      <nav className="d-flex flex-column overflow-auto">
      {
        navList.map(nav => 
          <button
            className={`btn p-3 text-start${nav.href === pathname ? " current" : ""}`}
            key={nav.key}
            id={`${nav.key}-btn`}
            onClick={() => navTo(nav.href)}
          >
            <i className={`bi ${nav.icon} me-1 fs-5`}></i> {nav.name}
          </button>
        )
      }
      </nav>

      <div className="d-flex p-3 align-items-center column-gap-2 cursor-default text-white">
        <img
          src="/avatars/default.jpg"
          alt="avatar"
          height="48px"
          width="48px"
          className="rounded-circle"
        />

        <div>
          <p className="mb-1 fw-bold">{currentUser?.fullName || "Admin"}</p>
          <a id="log-out" onClick={handleLogout} style={{ cursor: "pointer" }}>Đăng xuất</a>
        </div>
      </div>
    </header>
  );

  function handleLogout() {
    // Xóa thông tin user khỏi localStorage
    localStorage.removeItem("currentUser");
    
    alert("Đã đăng xuất!");
    navTo("/");
  }
};

export { SideNav };
