import React from 'react';

const RecordItem = ({ record, handleDownload }) => {
    return (
        <li>
            <div>
                Sinh viên: {record.student_id} | Môn: {record.subject} | Điểm: {record.grade} |
                Học kỳ: {record.semester}
            </div>
            {record.ipfs_hash ? (
                <>
                    <a
                        href={`http://localhost:8080/ipfs/${record.ipfs_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Xem PDF
                    </a>
                    <button
                        onClick={() => handleDownload(record.ipfs_hash, `bang_diem_${record.student_id}.pdf`)}
                    >
                        Tải xuống
                    </button>
                </>
            ) : 'N/A'}
        </li>
    );
};

export default RecordItem;