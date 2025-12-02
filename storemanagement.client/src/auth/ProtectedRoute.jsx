import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Lấy thông tin user từ localStorage
  const currentUser = (() => {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  })();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  const userRole = currentUser.role?.toLowerCase();

  // Kiểm tra phân quyền theo đường dẫn
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStaffRoute = location.pathname.startsWith('/staff');

  // Nếu là staff thì chỉ được vào /staff, không được vào /admin
  if (userRole === 'staff' && isAdminRoute) {
    return <Navigate to="/staff" replace />;
  }

  // Nếu là admin thì được vào cả /admin và /staff
  // (hoặc có thể chặn admin không vào staff nếu muốn)
  
  return children;
}


