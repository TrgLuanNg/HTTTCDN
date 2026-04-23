import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Kiểm tra trạng thái login
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      setIsLoggedIn(!!token);
      setUserRole(role || '');
      setUserName(user.fullname || user.email || '');
    };

    checkLoginStatus();
    // Lắng nghe sự kiện thay đổi localStorage
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('userLoggedIn', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('userLoggedIn', checkLoginStatus);
    };
  }, []);


  useEffect(() => {
    const updateCartBadge = () => {
      let cart = JSON.parse(localStorage.getItem("BOOK_CART")) || [];
      let total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    };
    
    updateCartBadge();
    // Lắng nghe sự kiện custom để cập nhật số lượng ngay lập tức khi ấn nút "Thêm vào giỏ"
    window.addEventListener('cartUpdated', updateCartBadge); 
    return () => window.removeEventListener('cartUpdated', updateCartBadge);
  }, []);

  // Hàm logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole('');
    setUserName('');
    navigate('/');
    window.dispatchEvent(new Event('userLoggedOut'));
  };

  // Hàm tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <>
      <header>
        <nav className="navbar navbar-expand-sm navbar-toggleable-sm fixed-top">
          <div className="container">
            <Link className="navbar-brand" to="/">
              <i className="fas fa-book-open me-2"></i>TheLibrary
            </Link>
            <div className="navbar-collapse collapse d-sm-inline-flex justify-content-between">
              <ul className="navbar-nav flex-grow-1">
                <li className="nav-item"><Link className="nav-link" to="/">Sách Mới</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/about">Về Chúng Tôi</Link></li>
                {(userRole === 'admin' || userRole === 'staff') && (
                  <li className="nav-item">
                    <Link className="nav-link text-primary fw-bold" to="/admin">
                      <i className="fas fa-cog me-1"></i> Quản trị
                    </Link>
                  </li>
                )}
              </ul>
              <div className="d-flex align-items-center gap-3">
                {/* Thanh tìm kiếm */}
                <form onSubmit={handleSearch} className="d-flex">
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    placeholder="Tìm kiếm sách..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <button className="btn btn-outline-secondary btn-sm ms-1" type="submit">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
                
                {/* Giỏ hàng */}
                <Link className="btn-cart text-decoration-none" to="/cart">
                  <i className="fas fa-shopping-bag me-1"></i> Giỏ hàng
                  <span className="badge-cart">{cartCount}</span>
                </Link>
                
                {/* Login/Logout */}
                {isLoggedIn ? (
                  <div className="dropdown">
                    <button 
                      className="btn btn-outline-primary rounded-pill px-3 dropdown-toggle" 
                      type="button" 
                      data-bs-toggle="dropdown"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <i className="fas fa-user me-2"></i> 
                      {userName.length > 15 ? userName.substring(0, 15) + '...' : userName}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><span className="dropdown-item-text text-muted small">Role: {userRole}</span></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item" onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <Link 
                    className="btn btn-danger rounded-pill px-4 fw-bold" 
                    to="/login"
                    style={{ fontSize: '0.9rem' }}
                  >
                    <i className="fas fa-user me-2"></i> Đăng Nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
      {/* Khoảng trống để không bị navbar đè lên nội dung */}
      <div style={{ height: '80px' }}></div> 
    </>
  );
}