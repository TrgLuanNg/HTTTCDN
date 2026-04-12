import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminDashboard() {
    return (
        <div className="container-fluid">
            <div className="row">
                <AdminSidebar />

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