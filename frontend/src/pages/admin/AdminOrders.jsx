import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STATUS_MAP = {
    pending:    { label: 'Chờ xử lý',   cls: 'bg-warning text-dark' },
    processing: { label: 'Đang xử lý',  cls: 'bg-info text-white' },
    completed:  { label: 'Hoàn thành',  cls: 'bg-success text-white' },
    cancelled:  { label: 'Đã huỷ',      cls: 'bg-danger text-white' },
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/admin/orders', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(r => r.json())
            .then(data => { 
                setOrders(Array.isArray(data) ? data : []); 
                setLoading(false); 
            })
            .catch(() => {
                setOrders([]);
                setLoading(false);
            });
    }, []);

    const filtered = orders.filter(o => {
        const matchSearch =
            String(o.fullname || '').toLowerCase().includes(search.toLowerCase()) ||
            String(o.id || '').includes(search) ||  
            String(o.phone_number || '').includes(search); 
            
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleDeleteOrder = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`http://localhost:8000/api/admin/orders/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (res.ok) {
                setOrders(prev => prev.filter(o => o.id !== deleteTarget.id));
                setDeleteTarget(null);
            } else {
                alert('Xóa đơn hàng thất bại!');
            }
        } catch (e) { 
            alert('Lỗi kết nối khi xóa đơn hàng!'); 
        }
    };

    const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-3 col-lg-2 d-md-block bg-dark sidebar vh-100 p-0 position-fixed">
                    <div className="p-4 text-white border-bottom border-secondary">
                        <h4 className="m-0">TheLibrary <span className="badge bg-danger small" style={{ fontSize: '0.5em' }}>ADMIN</span></h4>
                    </div>
                    <div className="nav flex-column p-3">
                        <Link className="nav-link text-white-50 mb-2" to="/admin"><i className="fas fa-chart-line me-2"></i> Thống kê</Link>
                        <Link className="nav-link text-white-50 mb-2" to="/admin/books"><i className="fas fa-book me-2"></i> Quản lý Sách</Link>
                        <Link className="nav-link text-white-50 mb-2" to="/admin/users"><i className="fas fa-users me-2"></i> Người dùng</Link>
                        <Link className="nav-link text-white active mb-2" to="/admin/orders"><i className="fas fa-shopping-cart me-2"></i> Đơn hàng</Link>
                        <hr className="text-secondary" />
                        <Link className="nav-link text-warning fw-bold" to="/"><i className="fas fa-arrow-left me-2"></i> Về Website</Link>
                    </div>
                </div>

                {/* Main */}
                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4" style={{ marginLeft: '16.666667%' }}>
                    <h2 className="mb-4">Quản lý Đơn hàng</h2>

                    {/* Stats */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center bg-primary text-white">
                                <h6>Tổng đơn</h6>
                                <h3>{orders.length}</h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center bg-warning text-dark">
                                <h6>Chờ xử lý</h6>
                                <h3>{orders.filter(o => o.status === 'pending').length}</h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center bg-success text-white">
                                <h6>Hoàn thành</h6>
                                <h3>{orders.filter(o => o.status === 'completed').length}</h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 text-center bg-info text-white">
                                <h6>Doanh thu</h6>
                                <h3>{totalRevenue.toLocaleString('vi-VN')}đ</h3>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body d-flex gap-3 flex-wrap">
                            <input
                                className="form-control w-auto flex-grow-1"
                                placeholder="Tìm theo tên, SĐT, mã đơn..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <select className="form-select w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="all">Tất cả trạng thái</option>
                                {Object.entries(STATUS_MAP).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card shadow-sm">
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>#ID</th>
                                                <th>Khách hàng</th>
                                                <th>SĐT</th>
                                                <th>Ngày đặt</th>
                                                <th>Tổng tiền</th>
                                                <th>Thanh toán</th>
                                                <th>Trạng thái</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.length === 0 ? (
                                                <tr><td colSpan={8} className="text-center py-4 text-muted">Không có đơn hàng</td></tr>
                                            ) : filtered.map(order => (
                                                <tr key={order.id}>
                                                    <td><small className="text-muted">{order.id?.toString().slice(0, 8)}...</small></td>
                                                    <td><strong>{order.fullname}</strong><br /><small className="text-muted">{order.address}</small></td>
                                                    <td>{order.phone_number}</td>
                                                    <td>{order.date_create ? new Date(order.date_create).toLocaleDateString('vi-VN') : '-'}</td>
                                                    <td><strong>{parseFloat(order.total_price || 0).toLocaleString('vi-VN')}đ</strong></td>
                                                    <td><span className="badge bg-secondary">{order.payment_method}</span></td>
                                                    <td>
                                                        <span className={`badge ${STATUS_MAP[order.status]?.cls || 'bg-secondary'}`}>
                                                            {STATUS_MAP[order.status]?.label || order.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setSelectedOrder(order)} title="Xem chi tiết">
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(order)} title="Xóa đơn hàng">
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal chi tiết đơn hàng */}
            {selectedOrder && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết đơn hàng</h5>
                                <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <p><strong>Khách hàng:</strong> {selectedOrder.fullname}</p>
                                        <p><strong>SĐT:</strong> {selectedOrder.phone_number}</p>
                                        <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Ngày đặt:</strong> {selectedOrder.date_create ? new Date(selectedOrder.date_create).toLocaleString('vi-VN') : '-'}</p>
                                        <p><strong>Thanh toán:</strong> {selectedOrder.payment_method}</p>
                                        <p><strong>Trạng thái:</strong> <span className={`badge ${STATUS_MAP[selectedOrder.status]?.cls || 'bg-secondary'}`}>{STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}</span></p>
                                    </div>
                                </div>
                                <h6>Sản phẩm</h6>
                                <table className="table table-sm">
                                    <thead><tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
                                    <tbody>
                                        {(selectedOrder.details || []).map((d, i) => (
                                            <tr key={i}>
                                                <td>{d.product_name || d.product_id}</td>
                                                <td>{d.quantity}</td>
                                                <td>{parseFloat(d.price).toLocaleString('vi-VN')}đ</td>
                                                <td>{(d.quantity * parseFloat(d.price)).toLocaleString('vi-VN')}đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr><td colSpan={3}><strong>Tổng cộng</strong></td><td><strong>{parseFloat(selectedOrder.total_price).toLocaleString('vi-VN')}đ</strong></td></tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa */}
            {deleteTarget && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-danger">Xác nhận xóa đơn hàng</h5>
                                <button className="btn-close" onClick={() => setDeleteTarget(null)}></button>
                            </div>
                            <div className="modal-body">
                                Bạn có chắc chắn muốn xóa đơn hàng của khách hàng <strong>{deleteTarget.fullname}</strong>?
                                <br/>
                                Hành động này không thể hoàn tác!
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Hủy</button>
                                <button className="btn btn-danger" onClick={handleDeleteOrder}>Xóa vĩnh viễn</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}