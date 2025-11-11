// src/pages/Home.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import '../assets/styles/Home.css';
import { fetchRecords, uploadRecord, downloadFile } from '../services/api';

const Home = () => {
    const [records, setRecords] = useState([]);
    const [formData, setFormData] = useState({
        student_id: '', subject: '', grade: '', semester: '',
    });
    const [file, setFile] = useState(null);
    const [notification, setNotification] = useState(null);

    // Tự động sắp xếp: mới nhất ở đầu
    const sortedRecords = useMemo(() =>
        [...records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        [records]
    );

    const loadRecords = useCallback(() => {
        fetchRecords()
            .then(setRecords)
            .catch(() => showNotification('Lỗi khi tải dữ liệu', 'error'));
    }, []);

    useEffect(() => loadRecords(), [loadRecords]);

    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) setFile(files[0]);
        else setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const err = {};
        if (!/^[0-9]{11}$/.test(formData.student_id)) err.student_id = 'Mã SV: 11 số';
        if (!formData.subject?.trim() || formData.subject.length < 3) err.subject = 'Môn học ≥ 3 ký tự';
        if (isNaN(formData.grade) || formData.grade < 0 || formData.grade > 10) err.grade = 'Điểm 0.0 - 10.0';
        if (!/^HK[1-2]-\d{4}$/.test(formData.semester)) err.semester = 'VD: HK1-2024';
        if (file) {
            if (!file.name.endsWith('.pdf')) err.file = 'Chỉ chấp nhận PDF';
            if (file.size > 5 * 1024 * 1024) err.file = 'File ≤ 5MB';
        }
        return err;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            showNotification(
                <ul className="error-list">
                    {Object.values(errors).map((msg, i) => <li key={i}>{msg}</li>)}
                </ul>,
                'error'
            );
            return;
        }

        try {
            const { record } = await uploadRecord(formData, file);
            setRecords(prev => [record, ...prev]);
            setFormData({ student_id: '', subject: '', grade: '', semester: '' });
            setFile(null);
            showNotification('Thêm thành công!', 'success');
        } catch (err) {
            showNotification(
                err.message.includes('IPFS') ? 'Lỗi IPFS: Bật IPFS Desktop!' : 'Lỗi server',
                'error'
            );
        }
    };

    const handleDownload = (hash, name) => {
        downloadFile(hash, name).catch(() =>
            showNotification('Lỗi tải file IPFS', 'error')
        );
    };

    return (
        <div className="home-container">
            <h1 className="home-title">Quản lý hồ sơ học tập</h1>

            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.msg}
                </div>
            )}

            <div className="home-content">
                {/* Danh sách */}
                <div className="record-list-section">
                    <h2>Danh sách hồ sơ</h2>
                    {sortedRecords.length === 0 ? (
                        <p className="no-data">Chưa có dữ liệu</p>
                    ) : (
                        <ul className="record-list">
                            {sortedRecords.map(r => (
                                <li key={r.id} className="record-item">
                                    <div className="record-info">
                                        <span className="info-field msv">SV: {r.student_id}</span>
                                        <span className="info-field mon">Môn: {r.subject}</span>
                                        <span className="info-field diem">Điểm: {r.grade}</span>
                                        <span className="info-field hk">HK: {r.semester}</span>
                                    </div>
                                    <div className="record-actions">
                                        {r.ipfs_hash ? (
                                            <>
                                                <a href={`http://localhost:5000/api/ipfs/${r.ipfs_hash}`} target="_blank" rel="noopener noreferrer" className="btn-view">
                                                    Xem
                                                </a>
                                                <button onClick={() => handleDownload(r.ipfs_hash, `bang_diem_${r.student_id}.pdf`)} className="btn-download">
                                                    Tải
                                                </button>
                                            </>
                                        ) : <span className="no-file">N/A</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Form */}
                <div className="form-section">
                    <h2>Thêm hồ sơ</h2>
                    <form onSubmit={handleSubmit} className="record-form">
                        {['student_id', 'subject', 'grade', 'semester'].map(field => (
                            <div key={field} className="form-group">
                                <label>{field === 'student_id' ? 'Mã sinh viên' : field === 'subject' ? 'Môn học' : field === 'grade' ? 'Điểm' : 'Học kỳ'}:</label>
                                <input
                                    type={field === 'grade' ? 'number' : 'text'}
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    required
                                    min={field === 'grade' ? 0 : undefined}
                                    max={field === 'grade' ? 10 : undefined}
                                    step={field === 'grade' ? 0.1 : undefined}
                                    placeholder={field === 'student_id' ? '11 số' : field === 'semester' ? 'HK1-2024' : field === 'grade' ? '0.0 - 10.0' : 'Tên môn'}
                                />
                            </div>
                        ))}
                        <div className="form-group">
                            <label>Tệp PDF:</label>
                            <input type="file" accept=".pdf" onChange={handleChange} />
                        </div>
                        <button type="submit" className="btn-submit">Thêm hồ sơ</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Home;