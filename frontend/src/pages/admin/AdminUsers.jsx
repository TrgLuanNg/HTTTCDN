import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/admin/users', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(r => r.json())
            .then(data => { setUsers(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = users.filter(u =>
        u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone_number?.includes(search)
    );

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await fetch(`http://localhost:8000/api/admin/users/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
        } catch (e) {
            alert('Xóa thất bại!');
        }
        setDeleteTarget(null);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
    };

    const AVATAR_COLORS = ['bg-primary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info'];
    const getColor = (id) => AVATAR_COLORS[(id?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

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
                        <Link className="nav-link text-white active mb-2" to="/admin/users"><i className="fas fa-users me-2"></i> Người dùng</Link>
                        <Link className="nav-link text-white-50 mb-2" to="/admin/orders"><i className="fas fa-shopping-cart me-2"></i> Đơn hàng</Link>
                        <hr className="text-secondary" />
                        <Link className="nav-link text-warning fw-bold" to="/"><i className="fas fa-arrow-left me-2"></i> Về Website</Link>
                    </div>
                </div>

                {/* Main */}
                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4" style={{ marginLeft: '16.666667%' }}>
                    <h2 className="mb-4">Quản lý Người dùng</h2>

                    {/* Stats */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm p-3 text-center bg-primary text-white">
                                <h6>Tổng người dùng</h6>
                                <h3>{users.length}</h3>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm p-3 text-center bg-success text-white">
                                <h6>Có địa chỉ</h6>
                                <h3>{users.filter(u => u.address).length}</h3>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm p-3 text-center bg-info text-white">
                                <h6>Có số điện thoại</h6>
                                <h3>{users.filter(u => u.phone_number).length}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <input
                                className="form-control"
                                placeholder="Tìm theo tên, email, số điện thoại..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
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
                                                <th>Người dùng</th>
                                                <th>Email</th>
                                                <th>SĐT</th>
                                                <th>Giới tính</th>
                                                <th>Địa chỉ</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center py-4 text-muted">Không có người dùng</td></tr>
                                            ) : filtered.map(user => (
                                                <tr key={user.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            {user.avatar_image ? (
                                                                <img src={user.avatar_image} alt="" className="rounded-circle" width={36} height={36} style={{ objectFit: 'cover' }} />
                                                            ) : (
                                                                <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold ${getColor(user.id)}`} style={{ width: 36, height: 36, fontSize: 13 }}>
                                                                    {getInitials(user.fullname)}
                                                                </div>
                                                            )}
                                                            <span>{user.fullname || <span className="text-muted">Chưa cập nhật</span>}</span>
                                                        </div>
                                                    </td>
                                                    <td>{user.email}</td>
                                                    <td>{user.phone_number || <span className="text-muted">-</span>}</td>
                                                    <td>{user.gender || <span className="text-muted">-</span>}</td>
                                                    <td><small>{user.address || <span className="text-muted">-</span>}</small></td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setSelectedUser(user)}>
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(user)}>
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

            {/* Modal xem chi tiết */}
            {selectedUser && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết người dùng</h5>
                                <button className="btn-close" onClick={() => setSelectedUser(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center mb-3">
                                    {selectedUser.avatar_image ? (
                                        <img src={selectedUser.avatar_image} alt="" className="rounded-circle" width={80} height={80} style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mx-auto ${getColor(selectedUser.id)}`} style={{ width: 80, height: 80, fontSize: 24 }}>
                                            {getInitials(selectedUser.fullname)}
                                        </div>
                                    )}
                                    <h5 className="mt-2">{selectedUser.fullname || 'Chưa cập nhật'}</h5>
                                </div>
                                <table className="table table-sm">
                                    <tbody>
                                        <tr><td className="text-muted">Email</td><td>{selectedUser.email}</td></tr>
                                        <tr><td className="text-muted">SĐT</td><td>{selectedUser.phone_number || '-'}</td></tr>
                                        <tr><td className="text-muted">Giới tính</td><td>{selectedUser.gender || '-'}</td></tr>
                                        <tr><td className="text-muted">Địa chỉ</td><td>{selectedUser.address || '-'}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Đóng</button>
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
                                <h5 className="modal-title text-danger">Xác nhận xóa</h5>
                                <button className="btn-close" onClick={() => setDeleteTarget(null)}></button>
                            </div>
                            <div className="modal-body">
                                Bạn có chắc muốn xóa người dùng <strong>{deleteTarget.fullname || deleteTarget.email}</strong>? Hành động này không thể hoàn tác.
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Hủy</button>
                                <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}