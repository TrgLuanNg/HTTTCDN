import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EMPTY_FORM = {
    name: '', price: '', quantity: '', publisher_year: '',
    publisher_id: '', category_ids: [], author_ids: [], image: '',
};

export default function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editBook, setEditBook] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);

    const TOKEN = localStorage.getItem('token');
    const HEADERS = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` };

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:8000/api/admin/books', { headers: HEADERS }).then(r => r.json()),
            fetch('http://localhost:8000/api/admin/publishers', { headers: HEADERS }).then(r => r.json()),
            fetch('http://localhost:8000/api/admin/categories', { headers: HEADERS }).then(r => r.json()),
            fetch('http://localhost:8000/api/admin/authors', { headers: HEADERS }).then(r => r.json()),
        ]).then(([b, p, c, a]) => {
            setBooks(b); setPublishers(p); setCategories(c); setAuthors(a);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filtered = books.filter(b =>
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.publisher?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => { setEditBook(null); setForm(EMPTY_FORM); setShowForm(true); };
    const openEdit = (book) => {
        setEditBook(book);
        setForm({
            name: book.name || '',
            price: book.price || '',
            quantity: book.quantity || '',
            publisher_year: book.publisher_year || '',
            publisher_id: book.publisher_id || '',
            category_ids: book.categories?.map(c => c.id) || [],
            author_ids: book.authors?.map(a => a.author_id) || [],
            image: book.image || '',
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editBook
                ? `http://localhost:8000/api/admin/books/${editBook.id}`
                : 'http://localhost:8000/api/admin/books';
            const method = editBook ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: HEADERS, body: JSON.stringify(form) });
            const saved = await res.json();
            if (editBook) {
                setBooks(prev => prev.map(b => b.id === saved.id ? saved : b));
            } else {
                setBooks(prev => [saved, ...prev]);
            }
            setShowForm(false);
        } catch {
            alert('Lưu thất bại!');
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await fetch(`http://localhost:8000/api/admin/books/${deleteTarget.id}`, {
                method: 'DELETE', headers: HEADERS,
            });
            setBooks(prev => prev.filter(b => b.id !== deleteTarget.id));
        } catch {
            alert('Xóa thất bại!');
        }
        setDeleteTarget(null);
    };

    const toggleMulti = (field, id) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(id)
                ? prev[field].filter(x => x !== id)
                : [...prev[field], id],
        }));
    };

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
                        <Link className="nav-link text-white active mb-2" to="/admin/books"><i className="fas fa-book me-2"></i> Quản lý Sách</Link>
                        <Link className="nav-link text-white-50 mb-2" to="/admin/users"><i className="fas fa-users me-2"></i> Người dùng</Link>
                        <Link className="nav-link text-white-50 mb-2" to="/admin/orders"><i className="fas fa-shopping-cart me-2"></i> Đơn hàng</Link>
                        <hr className="text-secondary" />
                        <Link className="nav-link text-warning fw-bold" to="/"><i className="fas fa-arrow-left me-2"></i> Về Website</Link>
                    </div>
                </div>

                {/* Main */}
                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4" style={{ marginLeft: '16.666667%' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0">Quản lý Sách</h2>
                        <button className="btn btn-primary" onClick={openAdd}>
                            <i className="fas fa-plus me-2"></i> Thêm sách
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm p-3 text-center bg-primary text-white">
                                <h6>Tổng đầu sách</h6>
                                <h3>{books.length}</h3>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm p-3 text-center bg-warning text-dark">
                                <h6>Tổng tồn kho</h6>
                                <h3>{books.reduce((s, b) => s + (b.quantity || 0), 0)}</h3>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm p-3 text-center bg-danger text-white">
                                <h6>Sắp hết hàng</h6>
                                <h3>{books.filter(b => (b.quantity || 0) < 5).length}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <input
                                className="form-control"
                                placeholder="Tìm theo tên sách, nhà xuất bản..."
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
                                                <th>Sách</th>
                                                <th>NXB</th>
                                                <th>Thể loại</th>
                                                <th>Tác giả</th>
                                                <th>Năm</th>
                                                <th>Giá</th>
                                                <th>Tồn kho</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.length === 0 ? (
                                                <tr><td colSpan={8} className="text-center py-4 text-muted">Không có sách</td></tr>
                                            ) : filtered.map(book => (
                                                <tr key={book.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            {book.image
                                                                ? <img src={book.image} alt="" width={40} height={55} style={{ objectFit: 'cover', borderRadius: 4 }} />
                                                                : <div className="bg-secondary d-flex align-items-center justify-content-center text-white" style={{ width: 40, height: 55, borderRadius: 4, fontSize: 18 }}><i className="fas fa-book"></i></div>
                                                            }
                                                            <span className="fw-semibold">{book.name}</span>
                                                        </div>
                                                    </td>
                                                    <td><small>{book.publisher?.name || '-'}</small></td>
                                                    <td>
                                                        {(book.categories || []).map(c => (
                                                            <span key={c.id} className="badge bg-light text-dark border me-1">{c.name}</span>
                                                        ))}
                                                    </td>
                                                    <td>
                                                        {(book.authors || []).map(a => (
                                                            <span key={a.author_id} className="badge bg-light text-dark border me-1">{a.name}</span>
                                                        ))}
                                                    </td>
                                                    <td>{book.publisher_year || '-'}</td>
                                                    <td><strong>{parseFloat(book.price || 0).toLocaleString('vi-VN')}đ</strong></td>
                                                    <td>
                                                        <span className={`badge ${(book.quantity || 0) < 5 ? 'bg-danger' : 'bg-success'}`}>
                                                            {book.quantity}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-warning me-1" onClick={() => openEdit(book)}>
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(book)}>
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

            {/* Modal thêm/sửa sách */}
            {showForm && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editBook ? 'Sửa sách' : 'Thêm sách mới'}</h5>
                                <button className="btn-close" onClick={() => setShowForm(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label">Tên sách <span className="text-danger">*</span></label>
                                        <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Giá (đ) <span className="text-danger">*</span></label>
                                        <input className="form-control" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Số lượng</label>
                                        <input className="form-control" type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Năm xuất bản</label>
                                        <input className="form-control" type="number" value={form.publisher_year} onChange={e => setForm(p => ({ ...p, publisher_year: e.target.value }))} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Nhà xuất bản</label>
                                        <select className="form-select" value={form.publisher_id} onChange={e => setForm(p => ({ ...p, publisher_id: e.target.value }))}>
                                            <option value="">-- Chọn NXB --</option>
                                            {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">URL hình ảnh</label>
                                        <input className="form-control" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Thể loại</label>
                                        <div className="border rounded p-2" style={{ maxHeight: 120, overflowY: 'auto' }}>
                                            {categories.map(c => (
                                                <div key={c.id} className="form-check">
                                                    <input className="form-check-input" type="checkbox"
                                                        checked={form.category_ids.includes(c.id)}
                                                        onChange={() => toggleMulti('category_ids', c.id)}
                                                        id={`cat-${c.id}`}
                                                    />
                                                    <label className="form-check-label" htmlFor={`cat-${c.id}`}>{c.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Tác giả</label>
                                        <div className="border rounded p-2" style={{ maxHeight: 120, overflowY: 'auto' }}>
                                            {authors.map(a => (
                                                <div key={a.author_id} className="form-check">
                                                    <input className="form-check-input" type="checkbox"
                                                        checked={form.author_ids.includes(a.author_id)}
                                                        onChange={() => toggleMulti('author_ids', a.author_id)}
                                                        id={`aut-${a.author_id}`}
                                                    />
                                                    <label className="form-check-label" htmlFor={`aut-${a.author_id}`}>{a.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                                    {editBook ? 'Lưu thay đổi' : 'Thêm sách'}
                                </button>
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
                                Bạn có chắc muốn xóa sách <strong>{deleteTarget.name}</strong>? Hành động này không thể hoàn tác.
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