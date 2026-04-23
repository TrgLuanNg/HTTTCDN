import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    const HEADERS = { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    };

    useEffect(() => {
        fetch('http://localhost:8000/api/admin/stats', { headers: HEADERS })
            .then(r => r.json())
            .then(data => { setStats(data || {}); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="container-fluid">
            <div className="row">
                <AdminSidebar />

                {/* Main Content */}
                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4" style={{marginLeft: '16.666667%'}}>
                    <h2 className="mb-4">Tổng quan hệ thống</h2>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            <div className="col-md-3">
                                <div className="card bg-primary text-white border-0 shadow-sm p-3 text-center">
                                    <h6>Tổng sản phẩm</h6>
                                    <h3>{stats.total_products || 0}</h3>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-success text-white border-0 shadow-sm p-3 text-center">
                                    <h6>Tổng người dùng</h6>
                                    <h3>{stats.total_users || 0}</h3>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-info text-white border-0 shadow-sm p-3 text-center">
                                    <h6>Tổng đơn hàng</h6>
                                    <h3>{stats.total_orders || 0}</h3>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-warning text-white border-0 shadow-sm p-3 text-center">
                                    <h6>Tổng doanh thu</h6>
                                    <h3>${(stats.total_revenue || 0).toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}