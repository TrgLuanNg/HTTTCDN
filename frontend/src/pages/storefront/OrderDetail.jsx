import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const HEADERS = { 
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/store/orders/${orderId}`, {
          headers: HEADERS
        });
        
        if (response.ok) {
          const orderData = await response.json();
          setOrder(orderData);
        } else {
          console.error('Failed to fetch order:', response.status);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning';
      case 'processing': return 'text-info';
      case 'shipped': return 'text-primary';
      case 'delivered': return 'text-success';
      case 'cancelled': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đã giao hàng';
      case 'delivered': return 'Đã giao hàng thành công';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary"></div>
            <p className="mt-3">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
            <h3>Không tìm thấy đơn hàng</h3>
            <p className="text-muted">Đơn hàng bạn tìm không tồn tại hoặc đã bị xóa.</p>
            <Link to="/orders" className="btn btn-primary mt-3">
              <i className="fas fa-arrow-left me-2"></i> Quay lại danh sách
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-receipt me-2"></i>
                  Chi tiết đơn hàng #{order.id?.toString().slice(0, 8)}
                </h5>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Thông tin khách hàng</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td className="text-muted">Họ tên:</td>
                          <td>{order.fullname || 'Chưa cập nhật'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Email:</td>
                          <td>{order.email || 'Chưa cập nhật'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">SĐT:</td>
                          <td>{order.phone_number || 'Chưa cập nhật'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Địa chỉ:</td>
                          <td><small>{order.address || 'Chưa cập nhật'}</small></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6>Thông tin đơn hàng</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td className="text-muted">Ngày đặt:</td>
                          <td>{new Date(order.date_create).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Trạng thái:</td>
                          <td>
                            <span className={`badge bg-${getStatusColor(order.status)} text-white`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted">Tổng tiền:</td>
                          <td className="fw-bold text-primary">
                            ${(order.total_price || 0).toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted">Phương thức thanh toán:</td>
                          <td>{order.payment_method || 'COD'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <h6>Sản phẩm đã đặt</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.details?.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <img 
                                    src={item.product?.image || 'https://via.placeholder.com/50x50'} 
                                    alt={item.product?.name}
                                    className="rounded"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  />
                                  <span>{item.product?.name}</span>
                                </div>
                              </td>
                              <td className="text-center">{item.quantity}</td>
                              <td className="text-center">${(item.price || 0).toLocaleString()}</td>
                              <td className="text-center fw-bold">
                                ${((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Link to="/orders" className="btn btn-secondary">
                    <i className="fas fa-arrow-left me-2"></i>
                    Quay lại danh sách đơn hàng
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>  
  );
}
