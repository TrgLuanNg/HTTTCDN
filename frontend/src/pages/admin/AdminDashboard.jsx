import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-3 col-lg-2 d-md-block bg-dark sidebar vh-100 p-0 position-fixed">
                    <div className="p-4 text-white border-bottom border-secondary">
                        <h4 className="m-0">TheLibrary <span className="badge bg-danger small" style={{fontSize:'0.5em'}}>ADMIN</span></h4>
                    </div>
                    <div className="nav flex-column p-3">
                        <Link className="nav-link text-white mb-2 active" to="/admin"><i className="fas fa-chart-line me-2"></i> Thống kê</Link>
                        <Link className="nav-link text-white-50 mb-2" to="/admin/books"><i className="fas fa-book me-2"></i> Quản lý Sách</Link>
                        <Link className="nav-link text-white-50 mb-2" to="/admin/users"><i className="fas fa-users me-2"></i> Người dùng</Link>
                        <Link className="nav-link text-white-50 mb-2" to="/admin/orders"><i className="fas fa-shopping-cart me-2"></i> Đơn hàng</Link>
                        <hr className="text-secondary" />
                        <Link className="nav-link text-white-50 mb-2" to="/admin/staff">
                            <i className="fas fa-user-tie me-2"></i> Quản lý Nhân viên
                        </Link>
                        <Link className="nav-link text-warning fw-bold" to="/"><i className="fas fa-arrow-left me-2"></i> Về Website</Link>
                    </div>
                </div>

                {/* Main Content */}
                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4" style={{marginLeft: '16.666667%'}}>
                    <h2 className="mb-4">Tổng quan hệ thống</h2>
                    <div className="row g-4">
                        <div className="col-md-3">
                            <div className="card bg-primary text-white border-0 shadow-sm p-3 text-center">
                                <h6>Tổng doanh thu</h6>
                                <h3>$45,200</h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-success text-white border-0 shadow-sm p-3 text-center">
                                <h6>Đơn hàng mới</h6>
                                <h3>12</h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-warning text-dark border-0 shadow-sm p-3 text-center">
                                <h6>Sách trong kho</h6>
                                <h3>840</h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-info text-white border-0 shadow-sm p-3 text-center">
                                <h6>Khách hàng</h6>
                                <h3>1,205</h3>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}