import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar.jsx';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      // Fix 1: Moved HEADERS inside useEffect to avoid recreation on every render
      const HEADERS = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      };
      try {
        const response = await fetch('http://localhost:8000/api/store/orders', {
          headers: HEADERS
        });
        
        if (response.ok) {
          const ordersData = await response.json();
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        } else {
          console.error('Failed to fetch orders:', response.status);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Fix 2: Return plain color names (e.g. 'warning') instead of 'text-warning'
  //         so they work correctly with the 'bg-' prefix in the template
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
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
            <p className="mt-3">Đang tải danh sách đơn hàng...</p>
          </div>
        </div>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="text-center">
            <i className="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
            <h3>Chưa có đơn hàng nào</h3>
            <p className="text-muted">Bạn chưa đặt đơn hàng nào.</p>
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
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>
                <i className="fas fa-shopping-bag me-2"></i>
                Đơn hàng của tôi
              </h2>
              <span className="badge bg-primary text-white">
                {orders.length} đơn hàng
              </span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Mã đơn hàng</th>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => 
                        order.details?.map((detail, index) => (
                          <tr key={`${order.id}-${detail.product_id}`}>
                            <td>
                              <span className="fw-bold">#{order.id?.toString().slice(0, 8)}</span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {detail.product?.image && (
                                  <img 
                                    src={detail.product.image} 
                                    alt={detail.product.name}
                                    style={{width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px'}}
                                  />
                                )}
                                <span>{detail.product?.name || 'Sản phẩm'}</span>
                              </div>
                            </td>
                            <td>{detail.quantity}</td>
                            <td>
                              {new Date(order.date_create).toLocaleDateString()}
                            </td>
                            <td className="fw-bold text-primary">
                              ${(order.total_price || 0).toLocaleString()}
                            </td>
                            <td>
                              <span className={`badge bg-${getStatusColor(order.status)} text-white`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td>
                              <a 
                                href={`/book/${detail.product_id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="fas fa-eye me-1"></i>
                                Xem
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}