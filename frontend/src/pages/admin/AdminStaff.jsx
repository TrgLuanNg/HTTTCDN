import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
const SHIFTS = ['Sáng', 'Chiều', 'Tối'];

export default function AdminStaff() {
    const [staffs, setStaffs] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [schedule, setSchedule] = useState([]); // [{day, shift}]

    useEffect(() => {
        fetch('http://localhost:8000/api/admin/staff', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json()).then(setStaffs);
    }, []);

    const fetchSchedule = (staff) => {
        setSelectedStaff(staff);
        fetch(`http://localhost:8000/api/admin/staff/${staff.id}/schedule`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json()).then(data => {
            setSchedule(data.map(d => ({ day: d.day_of_week, shift: d.shift_type })));
        });
    };

    const toggleShift = (day, shift) => {
        const exists = schedule.find(s => s.day === day && s.shift === shift);
        if (exists) {
            setSchedule(schedule.filter(s => !(s.day === day && s.shift === shift)));
        } else {
            setSchedule([...schedule, { day, shift }]);
        }
    };

    const calculateSalary = () => {
        let total = schedule.length * 250000;
        DAYS.forEach(day => {
            const shiftsInDay = schedule.filter(s => s.day === day).length;
            if (shiftsInDay === 3) total += 50000; // Thưởng làm nguyên ngày
        });
        return total;
    };

    const saveSchedule = () => {
        fetch(`http://localhost:8000/api/admin/staff/${selectedStaff.id}/schedule`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(schedule)
        }).then(() => alert("Đã lưu lịch làm việc!"));
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar giống các trang admin khác */}
                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4" style={{marginLeft: '16.6%'}}>
                    <h2>Quản lý Nhân viên</h2>
                    <table className="table mt-4">
                        <thead><tr><th>Họ tên</th><th>Email</th><th>Thao tác</th></tr></thead>
                        <tbody>
                            {staffs.map(s => (
                                <tr key={s.id}>
                                    <td>{s.fullname}</td>
                                    <td>{s.email}</td>
                                    <td>
                                        <button className="btn btn-sm btn-info me-2" onClick={() => fetchSchedule(s)}>Lịch & Lương</button>
                                        <button className="btn btn-sm btn-danger">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {selectedStaff && (
                        <div className="card mt-4 shadow-sm">
                            <div className="card-body">
                                <h4>Lịch làm việc: {selectedStaff.fullname}</h4>
                                <div className="table-responsive">
                                    <table className="table table-bordered text-center">
                                        <thead>
                                            <tr><th>Ca / Ngày</th>{DAYS.map(d => <th key={d}>{d}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {SHIFTS.map(shift => (
                                                <tr key={shift}>
                                                    <td><strong>{shift}</strong></td>
                                                    {DAYS.map(day => (
                                                        <td 
                                                            key={day} 
                                                            onClick={() => toggleShift(day, shift)}
                                                            className={schedule.find(s => s.day === day && s.shift === shift) ? "bg-success text-white" : "cursor-pointer"}
                                                            style={{cursor: 'pointer'}}
                                                        >
                                                            {schedule.find(s => s.day === day && s.shift === shift) ? "LÀM" : "-"}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-3 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="text-primary">Dự tính lương: {calculateSalary().toLocaleString()}đ</h5>
                                        <small>(250k/ca + 50k bonus nếu làm đủ 3 ca/ngày)</small>
                                    </div>
                                    <div>
                                        <button className="btn btn-success me-2" onClick={saveSchedule}>Lưu lịch làm việc</button>
                                        <button className="btn btn-warning" onClick={() => alert("Đã xác nhận thanh toán!")}>Thanh toán lương</button>
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