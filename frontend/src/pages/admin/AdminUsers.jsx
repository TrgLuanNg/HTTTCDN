import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ fullname: '', email: '', password: '', role: 'user' });

    const HEADERS = { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    };

    useEffect(() => {
        fetch('http://localhost:8000/api/admin/users', { headers: HEADERS })
            .then(r => r.json())
            .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = users.filter(u =>
        String(u.fullname || '').toLowerCase().includes(search.toLowerCase()) ||
        String(u.email || '').toLowerCase().includes(search.toLowerCase()) ||
        String(u.phone_number || '').includes(search) 
    );

    const handleAddUser = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch('http://localhost:8000/api/admin/users', {
                    method: 'POST',
                    headers: HEADERS,
                    body: JSON.stringify(newUser)
                });
                if (res.ok) {
                    const added = await res.json();
                    setUsers([...users, added]);
                    setShowAddModal(false);
                    setNewUser({ fullname: '', email: '', password: '', role: 'user' });
                } else {
                    alert("Lỗi khi thêm người dùng");
                }
            } catch (err) { alert("Không thể kết nối server"); }
        };

        const handleDelete = async () => {
            if (!deleteTarget) return;
            try {
                await fetch(`http://localhost:8000/api/admin/users/${deleteTarget.id}`, {
                    method: 'DELETE',
                    headers: HEADERS,
                });
                setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
            } catch (e) { alert('Xóa thất bại!'); }
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
                <AdminSidebar />

                {/* Main */}
                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4" style={{ marginLeft: '16.666667%' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Quản lý Người dùng</h2>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <i className="fas fa-user-plus me-2"></i>Thêm người dùng
                    </button>
                </div>

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
            {/* Modal Thêm người dùng */}
            {showAddModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <form className="modal-content" onSubmit={handleAddUser}>
                            <div className="modal-header">
                                <h5 className="modal-title">Thêm người dùng mới</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Họ tên</label>
                                    <input className="form-control" required value={newUser.fullname} onChange={e => setNewUser({...newUser, fullname: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Mật khẩu</label>
                                    <input type="password" title="Tối thiểu 6 ký tự" className="form-control" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Vai trò (Role)</label>
                                    <select className="form-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">Lưu người dùng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}                        
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