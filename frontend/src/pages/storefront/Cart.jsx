import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function Cart() {
  const navigate = useNavigate();
  // Khởi tạo state giỏ hàng từ localStorage
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("BOOK_CART")) || [];
  });

  // State cho form thông tin giao hàng
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Tính tổng tiền mỗi khi giỏ hàng thay đổi
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Cập nhật localStorage và Navbar mỗi khi cart state thay đổi
  useEffect(() => {
    localStorage.setItem("BOOK_CART", JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cart]);

  // Xử lý thay đổi số lượng
  const handleUpdateQty = (index, change) => {
    const newCart = [...cart];
    const newQty = newCart[index].quantity + change;
    
    // Kiểm tra giới hạn số lượng
    if (newQty > 0 && newQty <= (newCart[index].maxStock || 99)) {
      newCart[index].quantity = newQty;
      setCart(newCart);
    }
  };

  // Xóa sản phẩm khỏi giỏ
  const handleRemoveItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gửi API đặt hàng
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }

    // Kiểm tra đăng nhập (Vì API Checkout của FastAPI yêu cầu token)
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert("Vui lòng đăng nhập để thực hiện thanh toán!");
        navigate('/login');
        return;
    }

    setIsProcessing(true);

    try {
        // Định dạng dữ liệu gửi lên FastAPI giống với Schema CheckoutRequest đã viết
        const orderPayload = {
            address: formData.address,
            phone_number: formData.phone,
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }))
        };

        const response = await axiosClient.post('/store/checkout', orderPayload);
        
        if (response.data) {
            alert("🎉 Đặt hàng thành công! Hóa đơn đã được gửi qua email của bạn.");
            setCart([]); // Xóa giỏ hàng
            navigate('/'); // Quay về trang chủ
        }
    } catch (error) {
        console.error("Lỗi đặt hàng:", error);
        alert(error.response?.data?.detail || "Có lỗi xảy ra khi kết nối server.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="container py-5">
        <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Giỏ hàng của bạn</h2>

        <div className="row">
          {/* Cột hiển thị danh sách sản phẩm */}
          <div className="col-lg-7">
            <div className="table-responsive">
              <table className={`table align-middle ${cart.length === 0 ? 'd-none' : ''}`}>
                <thead className="table-light">
                  <tr>
                    <th>Sách</th>
                    <th>Giá</th>
                    <th>SL</th>
                    <th>Tổng</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => {
                    const subTotal = item.price * item.quantity;
                    return (
                      <tr key={item.id}>
                        <td>
                          <img src={item.image || 'https://via.placeholder.com/40'} width="40" className="me-2" alt={item.name} /> 
                          {item.name}
                        </td>
                        <td>${item.price}</td>
                        <td>
                          <button type="button" className="btn btn-sm btn-light border" onClick={() => handleUpdateQty(index, -1)}>-</button>
                          <span className="mx-2">{item.quantity}</span>
                          <button type="button" className="btn btn-sm btn-light border" onClick={() => handleUpdateQty(index, 1)}>+</button>
                        </td>
                        <td>${subTotal.toFixed(2)}</td>
                        <td>
                          <i className="fas fa-times text-danger" style={{ cursor: 'pointer' }} onClick={() => handleRemoveItem(index)}></i>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Thông báo giỏ hàng trống */}
              {cart.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted">Giỏ hàng trống</p>
                  <Link to="/" className="btn btn-outline-dark">Mua sắm ngay</Link>
                </div>
              )}
            </div>
          </div>

          {/* Cột Form thanh toán */}
          <div className="col-lg-5">
            <div className="bg-light p-4 rounded shadow-sm">
              <h4 className="mb-3">Thông tin giao hàng</h4>
              <form onSubmit={handleSubmitOrder}>
                <div className="mb-3">
                  <label>Họ và tên</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="form-control" required placeholder="Nguyễn Văn A" />
                </div>
                <div className="mb-3">
                  <label>Email (để nhận hóa đơn)</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-control" required placeholder="email@example.com" />
                </div>
                <div className="mb-3">
                  <label>Số điện thoại</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="form-control" required placeholder="0909xxxxxx" />
                </div>
                <div className="mb-3">
                  <label>Địa chỉ nhận hàng</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} className="form-control" rows="2" required placeholder="Số nhà, đường, phường, quận..."></textarea>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <span className="h5 fw-bold">Tổng thanh toán:</span>
                  <span className="h5 fw-bold text-danger">${totalAmount.toFixed(2)}</span>
                </div>
                <button 
                    type="submit" 
                    className="btn btn-dark w-100 py-3 fw-bold text-uppercase" 
                    disabled={isProcessing || cart.length === 0}
                >
                  {isProcessing ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                </button>
                <div className="mt-4 p-3 bg-light rounded text-center">
                  <p className="mb-2 text-muted small">Đăng nhập để lưu đơn hàng và nhận ưu đãi</p>
                  <Link to="/login" className="btn btn-outline-dark btn-sm rounded-pill px-4">
                    Đăng nhập ngay
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}