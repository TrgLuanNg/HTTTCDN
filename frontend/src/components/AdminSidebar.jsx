import { Link, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
    const location = useLocation();
    const path = location.pathname;

    return (
        <div className="col-md-3 col-lg-2 d-md-block bg-dark sidebar vh-100 p-0 position-fixed" style={{ zIndex: 100 }}>
            <div className="p-4 text-white border-bottom border-secondary">
                <h4 className="m-0 text-truncate">TheLibrary <span className="badge bg-danger small align-top" style={{ fontSize: '0.5em' }}>ADMIN</span></h4>
            </div>
            <div className="nav flex-column p-3">
                <Link className={`nav-link mb-2 ${path === '/admin' ? 'text-white fw-bold bg-secondary bg-opacity-25 rounded' : 'text-white-50'}`} to="/admin">
                    <i className="fas fa-chart-line me-2 w-20px text-center"></i> Thống kê
                </Link>
                
                <Link className={`nav-link mb-2 ${path.includes('/admin/books') ? 'text-white fw-bold bg-secondary bg-opacity-25 rounded' : 'text-white-50'}`} to="/admin/books">
                    <i className="fas fa-book me-2 w-20px text-center"></i> Quản lý Sách
                </Link>
                
                <Link className={`nav-link mb-2 ${path.includes('/admin/users') ? 'text-white fw-bold bg-secondary bg-opacity-25 rounded' : 'text-white-50'}`} to="/admin/users">
                    <i className="fas fa-users me-2 w-20px text-center"></i> Khách hàng
                </Link>
                
                {/* Nút Nhân viên mới thêm vào */}
                <Link className={`nav-link mb-2 ${path.includes('/admin/staff') ? 'text-white fw-bold bg-secondary bg-opacity-25 rounded' : 'text-white-50'}`} to="/admin/staff">
                    <i className="fas fa-user-tie me-2 w-20px text-center"></i> Nhân viên
                </Link>
                
                <Link className={`nav-link mb-2 ${path.includes('/admin/orders') ? 'text-white fw-bold bg-secondary bg-opacity-25 rounded' : 'text-white-50'}`} to="/admin/orders">
                    <i className="fas fa-shopping-cart me-2 w-20px text-center"></i> Đơn hàng
                </Link>
                
                <hr className="text-secondary my-3" />
                
                <Link className="nav-link text-warning fw-bold" to="/">
                    <i className="fas fa-arrow-left me-2 w-20px text-center"></i> Về Website
                </Link>
            </div>
        </div>
    );
}