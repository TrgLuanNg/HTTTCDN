import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StorefrontHome from './pages/storefront/StoreFrontHome';
import SearchBooks from './pages/storefront/SearchBooks';
import BookDetail from './pages/storefront/BookDetail';
import Cart from './pages/storefront/Cart';
import Login from './pages/storefront/Login';
import Register from './pages/storefront/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminStaff from './pages/admin/AdminStaff';
import ProtectedRoute from './components/ProtectedRoute';

// Import tạm các component chưa tạo để giữ chỗ
const DashboardHome = () => <h2>Trang Quản trị Admin </h2>;
const NotFound = () => <h2>404 - Không tìm thấy trang</h2>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StorefrontHome />} />
        <Route path="/search" element={<SearchBooks />} />
        <Route path="/book/:bookId" element={<BookDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin", "staff"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/books" element={
          <ProtectedRoute allowedRoles={["admin", "staff"]}>
            <AdminBooks />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute allowedRoles={["admin", "staff"]}>
            <AdminOrders />
          </ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminStaff />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;