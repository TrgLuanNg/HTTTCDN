import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function Register() {
    const navigate = useNavigate();
    
    // Gom chung state vào 1 object cho dễ quản lý
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        address: '',
        phone_number: '',
        gender: 'Khác' // Mặc định
    });

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Hàm xử lý khi gõ vào input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        try {
        // formData lúc này đã bao gồm: fullname, email, password, address, phone_number, gender
        const response = await axiosClient.post('/auth/register', formData); 
        console.log("Dữ liệu gửi đi:", formData);
        setSuccessMsg("Đăng ký thành công! Đang chuyển hướng ...");
        // ... điều hướng ...
        } catch (err) {
        setError(err.response?.data?.detail || "Lỗi đăng ký");
        } finally {
        setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1); // Nút hủy: quay lại trang liền trước đó (hoặc bạn có thể đổi thành navigate('/'))
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-7 col-lg-6">
                    <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-5">
                            <h3 className="text-center mb-4" style={{ fontFamily: "'Playfair Display', serif", color: "#2c3e50" }}>
                                Đăng Ký Tài Khoản
                            </h3>
                            
                            {error && <div className="alert alert-danger py-2">{error}</div>}
                            {successMsg && <div className="alert alert-success py-2">{successMsg}</div>}

                            <form onSubmit={handleRegister}>
                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label text-muted">Họ và Tên</label>
                                        <input type="text" name="fullname" className="form-control" placeholder="Nhập họ và tên" value={formData.fullname} onChange={handleChange} required />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted">Email</label>
                                        <input type="email" name="email" className="form-control" placeholder="Nhập email" value={formData.email} onChange={handleChange} required />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted">Mật khẩu</label>
                                        <input type="password" name="password" className="form-control" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted">Số điện thoại</label>
                                        <input type="text" name="phone_number" className="form-control" placeholder="Nhập số điện thoại" value={formData.phone_number} onChange={handleChange} />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted d-block mb-2">Giới tính</label>
                                        <div className="d-flex gap-2">
                                            {/* Nút chọn Nam */}
                                            <input 
                                                type="radio" 
                                                className="btn-check" // Class của Bootstrap để ẩn ô tròn đi
                                                name="gender" 
                                                id="genderNam" 
                                                value="Nam" 
                                                checked={formData.gender === 'Nam'} // Kiểm tra xem có đang được chọn không
                                                onChange={handleChange} // Dùng chung hàm handleChange cũ
                                            />
                                            <label className="btn btn-outline-dark rounded-pill w-100 py-2" htmlFor="genderNam">
                                                <i className="fas fa-mars me-2"></i> Nam
                                            </label>

                                            {/* Nút chọn Nữ */}
                                            <input 
                                                type="radio" 
                                                className="btn-check" 
                                                name="gender" 
                                                id="genderNu" 
                                                value="Nữ" 
                                                checked={formData.gender === 'Nữ'} 
                                                onChange={handleChange} 
                                            />
                                            <label className="btn btn-outline-dark rounded-pill w-100 py-2" htmlFor="genderNu">
                                                <i className="fas fa-venus me-2"></i> Nữ
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-md-12 mb-4">
                                        <label className="form-label text-muted">Địa chỉ</label>
                                        <textarea name="address" className="form-control" rows="2" placeholder="Nhập địa chỉ của bạn" value={formData.address} onChange={handleChange}></textarea>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 mt-2">
                                    <button type="button" className="btn btn-outline-secondary w-50 py-2 fw-bold text-uppercase" onClick={handleCancel} disabled={isLoading}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-dark w-50 py-2 fw-bold text-uppercase" disabled={isLoading}>
                                        {isLoading ? "Đang xử lý..." : "Đăng Ký"}
                                    </button>
                                </div>
                            </form>

                            <div className="text-center mt-4">
                                <span className="text-muted">Đã có tài khoản? </span>
                                <Link to="/login" className="text-decoration-none fw-bold" style={{ color: "#c0392b" }}>
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}