import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  // Logic đếm số lượng giỏ hàng y hệt file _Layout.cshtml của bạn
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
                <li className="nav-item"><Link className="nav-link" to="/authors">Tác Giả</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/about">Về Chúng Tôi</Link></li>
              </ul>
              <div className="d-flex align-items-center">
                <Link className="btn-cart text-decoration-none" to="/cart">
                  <i className="fas fa-shopping-bag me-1"></i> Giỏ hàng
                  <span className="badge-cart">{cartCount}</span>
                </Link>
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