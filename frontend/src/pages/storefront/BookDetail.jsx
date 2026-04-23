import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import Navbar from '../../components/Navbar.jsx';

export default function BookDetail() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axiosClient.get(`/api/store/books/${bookId}`);
        console.log('Book Detail API Response:', response.data);
        setBook(response.data);
      } catch (error) {
        console.error('Error fetching book:', error);
        if (error.response?.status === 404) {
          alert('Không tìm thấy sách này!');
        }
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  const addToCart = () => {
    if (!book) return;
    
    let cart = JSON.parse(localStorage.getItem("BOOK_CART")) || [];
    let item = cart.find(x => x.id === book.id);
    
    if (item) {
        if (item.quantity >= book.quantity) {
            alert("Đã đạt giới hạn số lượng trong kho!");
            return;
        }
        item.quantity += quantity;
    } else {
        cart.push({ 
            id: book.id, 
            name: book.name, 
            price: book.price, 
            image: book.image, 
            quantity: quantity, 
            maxStock: book.quantity 
        });
    }
    
    localStorage.setItem("BOOK_CART", JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (book?.quantity || 99)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="text-center">
            <i className="fas fa-book fa-3x text-muted mb-3"></i>
            <h3>Không tìm thấy sách</h3>
            <p className="text-muted">Sách bạn tìm không tồn tại hoặc đã bị xóa.</p>
            <Link to="/" className="btn btn-dark">
              <i className="fas fa-arrow-left me-2"></i> Quay lại trang chủ
            </Link>
          </div>
        </div>
      </>
    );
  }

  const discountedPrice = book ? book.price - (book.price * (book.discount / 100)) : 0;
  const isInStock = book ? book.quantity > 0 : false;

  return (
    <>
      <Navbar />
      {book && (
        <div className="container py-5">
        <div className="row">
          {/* Hình ảnh sách */}
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <img 
                src={book?.image || 'https://via.placeholder.com/300x450'} 
                className="card-img-top" 
                alt={book?.name}
                style={{ height: '450px', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="col-md-8">
            <div className="mb-3">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                  <li className="breadcrumb-item active">{book?.name}</li>
                </ol>
              </nav>
            </div>

            <h1 className="mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "#2c3e50" }}>
              {book?.name}
            </h1>

            <div className="mb-4">
              {book?.discount > 0 ? (
                <div>
                  <span className="text-muted text-decoration-line-through me-2">
                    ${book?.price}
                  </span>
                  <span className="h4 text-danger fw-bold">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="badge bg-danger ms-2">
                    -{book?.discount}%
                  </span>
                </div>
              ) : (
                <span className="h4 text-dark fw-bold">
                  ${book?.price}
                </span>
              )}
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Tác giả:</strong> {book?.author?.name || book?.author || ''}
                </p>
                <p className="mb-2">
                  <strong>Nhà xuất bản:</strong> {book?.publisher?.name || book?.publisher || ''}
                </p>
                <p className="mb-2">
                  <strong>Năm xuất bản:</strong> {book?.publisher_year || ''}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Thể loại:</strong> {book?.category?.name || book?.category || ''}
                </p>
                <p className="mb-2">
                  <strong>Số trang:</strong> {book?.pages || ''}
                </p>
                <p className="mb-2">
                  <strong>Kho:</strong> 
                  <span className={`fw-bold ${isInStock ? 'text-success' : 'text-danger'}`}>
                    {isInStock ? ` Còn ${book?.quantity} cuốn` : ' Hết hàng'}
                  </span>
                </p>
              </div>
            </div>

            {/* Mô tả sách */}
            <div className="mb-4">
              <h5>Mô tả</h5>
              <p className="text-muted">
                {book?.description || ''}
              </p>
            </div>

            {/* Chọn số lượng và thêm vào giỏ */}
            <div className="card border-0 bg-light">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-4">
                    <label className="form-label">Số lượng:</label>
                    <div className="input-group" style={{ maxWidth: '150px' }}>
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button" 
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <input 
                        type="number" 
                        className="form-control text-center" 
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val >= 1 && val <= book.quantity) {
                            setQuantity(val);
                          }
                        }}
                        min="1"
                        max={book.quantity}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button" 
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= book.quantity}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <button 
                      className="btn btn-dark btn-lg px-5 py-3"
                      onClick={addToCart}
                      disabled={!isInStock}
                    >
                      <i className="fas fa-cart-plus me-2"></i>
                      {isInStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <small className="text-muted">
                    <i className="fas fa-truck me-1"></i>
                    Miễn phí vận chuyển cho đơn hàng trên $100
                  </small>
                </div>
              </div>
            </div>

            {/* Các sách liên quan */}
            <div className="mt-5">
              <h4>Các sách liên quan</h4>
              <div className="row">
                {/* Có thể thêm logic để hiển thị sách liên quan sau */}
                <div className="col-12 text-center py-4">
                  <p className="text-muted">Đang cập nhật sách liên quan...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <div className="container text-center">
          &copy; 2025 - TheLibrary - Mang tri thức đến mọi nhà
        </div>
      </footer>

      {/* Toast Thông báo */}
      {toastVisible && (
        <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          background: '#27ae60', 
          color: 'white', 
          padding: '12px 25px', 
          borderRadius: '4px', 
          boxShadow: '0 5px 15px rgba(0,0,0,0.2)', 
          zIndex: 9999, 
          fontWeight: 500 
        }}>
          <i className="fas fa-check me-2"></i> Đã thêm vào giỏ
        </div>
      )}
    </>
  );
}
