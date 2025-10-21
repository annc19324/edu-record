import React from 'react';
import '../App.css';

const RecordForm = ({ formData, setFormData, file, setFile, handleSubmit }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    return (
        <div>
            <h2>Thêm hồ sơ</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Mã sinh viên: </label>
                    <input
                        type="text"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Môn học: </label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Điểm: </label>
                    <input
                        type="number"
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="10"
                        step="0.1"
                    />
                </div>
                <div>
                    <label>Học Kỳ: </label>
                    <input
                        type="text"
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Tệp PDF: </label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                    />
                </div>
                <button type="submit">Thêm hồ sơ</button>
            </form>
        </div>
    );
};

export default RecordForm;