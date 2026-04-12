import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
const SHIFTS = ['Sáng', 'Chiều', 'Tối'];

export default function AdminStaff() {
    const [staffs, setStaffs] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [schedule, setSchedule] = useState([]); // [{day, shift}]
    const [loading, setLoading] = useState(true);

    const HEADERS = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    };

    // Lấy danh sách nhân viên
    useEffect(() => {
        // Lưu ý: Gọi đúng đường dẫn backend của bạn (không có /api)
        fetch('http://localhost:8000/api/admin/staff', { headers: HEADERS })
            .then(r => r.json())
            .then(data => {
                setStaffs(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi tải nhân viên:", err);
                setStaffs([]);
                setLoading(false);
            });
    }, []);

    // Lấy lịch làm việc của 1 nhân viên
    const fetchSchedule = (staff) => {
        setSelectedStaff(staff);
        setSchedule([]); // Xóa lịch cũ trên màn hình trong lúc tải lịch mới
        
        fetch(`http://localhost:8000/api/admin/staff/${staff.id}/schedule`, { headers: HEADERS })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSchedule(data.map(d => ({ day: d.day_of_week, shift: d.shift_type })));
                }
            })
            .catch(err => console.error("Lỗi tải lịch làm việc:", err));
    };

    // Bật/tắt 1 ca làm việc
    const toggleShift = (day, shift) => {
        const exists = schedule.find(s => s.day === day && s.shift === shift);
        if (exists) {
            setSchedule(schedule.filter(s => !(s.day === day && s.shift === shift)));
        } else {
            setSchedule([...schedule, { day, shift }]);
        }
    };

    // Tính toán lương
    const calculateSalary = () => {
        let total = schedule.length * 250000;
        DAYS.forEach(day => {
            const shiftsInDay = schedule.filter(s => s.day === day).length;
            if (shiftsInDay === 3) total += 50000; // Thưởng làm nguyên ngày
        });
        return total;
    };

    // Lưu lịch làm việc xuống database
    const saveSchedule = () => {
        fetch(`http://localhost:8000/api/admin/staff/${selectedStaff.id}/schedule`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(schedule)
        })
        .then(r => {
            if(r.ok) alert("Đã lưu lịch làm việc thành công!");
            else alert("Có lỗi xảy ra khi lưu lịch!");
        })
        .catch(() => alert("Không thể kết nối đến máy chủ."));
    };

    // Xóa nhân viên (Cần gọi thêm API xóa ở backend)
    const handleDeleteStaff = (staff) => {
        if(window.confirm(`Bạn có chắc muốn xóa nhân viên ${staff.fullname}?`)) {
            // Tạm thời ẩn khỏi danh sách (Bạn cần nối với API backend để xóa thật)
            setStaffs(staffs.filter(s => s.id !== staff.id));
            if(selectedStaff?.id === staff.id) setSelectedStaff(null);
        }
    };

    return (
        <div className="container-fluid bg-light min-vh-100">
            <div className="row">
                {/* 1. Sidebar nằm ĐÚNG CHỖ (Bên ngoài thẻ main) */}
                <AdminSidebar />

                {/* 2. Nội dung chính nằm bên phải */}
                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4" style={{ marginLeft: '16.666667%' }}>
                    
                    {/* Header trang đồng bộ */}
                    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
                        <h2 className="h2">Quản lý Nhân viên</h2>
                        <button className="btn btn-primary">
                            <i className="fas fa-plus me-2"></i>Thêm nhân viên mới
                        </button>
                    </div>

                    {/* Bảng Danh sách nhân viên */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                            ) : staffs.length === 0 ? (
                                <div className="text-center py-4 text-muted">Chưa có nhân viên nào trong hệ thống.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Họ tên</th>
                                                <th>Email</th>
                                                <th>Số điện thoại</th>
                                                <th className="text-end">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffs.map(s => (
                                                <tr key={s.id} className={selectedStaff?.id === s.id ? 'table-primary' : ''}>
                                                    <td><strong>{s.fullname}</strong></td>
                                                    <td>{s.email}</td>
                                                    <td>{s.phone_number || '-'}</td>
                                                    <td className="text-end">
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary me-2" 
                                                            onClick={() => fetchSchedule(s)}
                                                        >
                                                            <i className="fas fa-calendar-alt me-1"></i> Lịch & Lương
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteStaff(s)}
                                                        >
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

                    {/* Bảng Lịch làm việc & Lương (Chỉ hiện khi đã chọn 1 nhân viên) */}
                    {selectedStaff && (
                        <div className="card shadow-sm border-primary">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Ca làm việc trong tuần - <strong>{selectedStaff.fullname}</strong></h5>
                            </div>
                            <div className="card-body">
                                <p className="text-muted small mb-3">
                                    <i className="fas fa-info-circle me-1"></i>
                                    Nhấp vào các ô trong bảng để thêm/hủy ca làm việc.
                                </p>
                                
                                <div className="table-responsive">
                                    <table className="table table-bordered text-center align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '12%' }}>Ca / Ngày</th>
                                                {DAYS.map(d => <th key={d} style={{ width: '12%' }}>{d}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {SHIFTS.map(shift => (
                                                <tr key={shift}>
                                                    <td className="bg-light"><strong>{shift}</strong><br/><small className="text-muted">{shift === 'Sáng' ? '08:00 - 13:00' : shift === 'Chiều' ? '13:00 - 18:00' : '18:00 - 23:00'}</small></td>
                                                    
                                                    {DAYS.map(day => {
                                                        const isActive = schedule.find(s => s.day === day && s.shift === shift);
                                                        return (
                                                            <td 
                                                                key={day} 
                                                                onClick={() => toggleShift(day, shift)}
                                                                className={isActive ? "bg-success text-white fw-bold" : ""}
                                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                                title="Nhấp để thay đổi"
                                                            >
                                                                {isActive ? <><i className="fas fa-check-circle d-block mb-1"></i>LÀM</> : <span className="text-muted">-</span>}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <hr className="my-4" />

                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                    <div className="p-3 bg-light rounded border">
                                        <h4 className="text-success mb-1">Dự tính lương: {calculateSalary().toLocaleString('vi-VN')} đ</h4>
                                        <small className="text-muted">
                                            <i className="fas fa-coins me-1"></i>
                                            Đơn giá: 250.000đ/ca + Thưởng 50.000đ nếu làm đủ 3 ca/ngày.
                                        </small>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-warning px-4" onClick={() => alert("Chức năng thanh toán đang được xử lý.")}>
                                            <i className="fas fa-money-bill-wave me-2"></i>Thanh toán lương
                                        </button>
                                        <button className="btn btn-success px-4" onClick={saveSchedule}>
                                            <i className="fas fa-save me-2"></i>Lưu thay đổi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}