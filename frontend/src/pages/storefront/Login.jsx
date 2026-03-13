import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // FastAPI OAuth2 yêu cầu định dạng x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const response = await axiosClient.post('/auth/login', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.data.access_token) {
                // Lưu token vào localStorage
                localStorage.setItem('access_token', response.data.access_token);
                alert("Đăng nhập thành công!");
                navigate('/'); // Chuyển hướng về trang chủ
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-5">
                            <h3 className="text-center mb-4" style={{ fontFamily: "'Playfair Display', serif", color: "#2c3e50" }}>
                                Đăng Nhập
                            </h3>
                            
                            {error && <div className="alert alert-danger py-2">{error}</div>}

                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Email</label>
                                    <input 
                                        type="email" 
                                        className="form-control form-control-lg" 
                                        placeholder="Nhập email của bạn"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label text-muted">Mật khẩu</label>
                                    <input 
                                        type="password" 
                                        className="form-control form-control-lg" 
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-dark w-100 py-3 fw-bold text-uppercase"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <span className="text-muted">Chưa có tài khoản? </span>
                                <Link to="/register" className="text-decoration-none fw-bold" style={{ color: "#c0392b" }}>
                                    Đăng ký ngay
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}