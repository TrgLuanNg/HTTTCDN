import axios from 'axios';

// Đảm bảo cổng 8000 khớp với cổng FastAPI đang chạy của bạn
const axiosClient = axios.create({
    baseURL: 'http://localhost:8000', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Tự động đính kèm Token bảo mật nếu user đã đăng nhập
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;