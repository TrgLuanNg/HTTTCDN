import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StorefrontHome from './pages/storefront/StoreFrontHome';
import Cart from './pages/storefront/Cart';
import Login from './pages/storefront/Login';
import Register from './pages/storefront/Register';

// Import tạm các component chưa tạo để giữ chỗ
const DashboardHome = () => <h2>Trang Quản trị Admin </h2>;
const NotFound = () => <h2>404 - Không tìm thấy trang</h2>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StorefrontHome />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<DashboardHome />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;