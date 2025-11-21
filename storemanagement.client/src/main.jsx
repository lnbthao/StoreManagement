import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { SideNav } from "./components/nav";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './auth/axios.js';
import ProtectedRoute from './auth/ProtectedRoute';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Import trang đăng nhập
import Login from "./login/Login";

// Import trang thanh toán
import Checkout from "./checkout/Checkout";

// Import các trang bên Admin
/*
  Khi bắt đầu code trang thống kê:
  - Thay đổi import App thành import cái trang thống kê.
  - Và xóa cái file App.jsx. File này chỉ là file trang chủ TẠM THỜI.
*/
import Dashboard from "./dashboard/Dashboard";
import CategoryManagement from "./category/CategoryManagement";
import AddUpCategory from "./category/AddUpCategory";
import SupplierManagement from "./supplier/SupplierManagement";
import AddUpSupplier from "./supplier/AddUpSupplier";
import ProductManagement from "./product/ProductManagement";
import AddUpProduct from "./product/AddUpProduct";
import PromotionManagement from "./promotion/PromotionManagement";
import AddUpPromotion from "./promotion/AddUpPromotion";
import OrderManagement from "./order/OrderManagement";
import AddOrder from "./order/AddOrder";
import UserManagement from "./user/UserManagement";
import AddUpUser from "./user/AddUpUser";
import CustomerManagement from "./customer/CustomerManagement";
import AddUpCustomer from "./customer/AddUpCustomer";
import { StaffNav } from "./components/staff-nav";
import StaffOrder from "./staff-order/StaffOrder";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route index element={<Login />} />
        <Route path="/staff/*" element={
          <main id="staff">
            <StaffNav />
            <section className="p-3 overflow-auto">
              <Routes>
                <Route index element={<Checkout />} />
                <Route path="order" element={<StaffOrder />} />
              </Routes>
            </section>
          </main>
        } />

        <Route path="/admin/*" element={
          <ProtectedRoute>
            <main className="d-grid" id="admin">
              <SideNav />
              <section className="p-3 overflow-auto vh-100">
                <Routes>
                  <Route index element={<Dashboard />} />

                <Route path="supplier">
                  <Route index element={<SupplierManagement />} />
                  <Route path="add" element={<AddUpSupplier />} />
                  <Route path="edit/:id" element={<AddUpSupplier status />} />
                </Route>

                <Route path="category">
                  <Route index element={<CategoryManagement />} />
                  <Route path="add" element={<AddUpCategory />} />
                  <Route path="edit/:id" element={<AddUpCategory status />} />
                </Route>

                <Route path="product">
                  <Route index element={<ProductManagement />} />
                  <Route path="add" element={<AddUpProduct />} />
                  <Route path="edit/:id" element={<AddUpProduct status />} />
                </Route>

                <Route path="promotion">
                  <Route index element={<PromotionManagement />} />
                  <Route path="add" element={<AddUpPromotion />} />
                  <Route path="edit/:id" element={<AddUpPromotion status />} />
                </Route>

                <Route path="order">
                  <Route index element={<OrderManagement />} />
                  <Route path="add" element={<AddOrder />} />
                </Route>

                <Route path="user">
                  <Route index element={<UserManagement />} />
                  <Route path="add" element={<AddUpUser />} />
                  <Route path="edit/:id" element={<AddUpUser status />} />
                </Route>

                <Route path="customer">
                  <Route index element={<CustomerManagement />} />
                  <Route path="add" element={<AddUpCustomer />} />
                  <Route path="edit/:id" element={<AddUpCustomer status />} />
                </Route>
                </Routes>
              </section>
            </main>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>
);
