import React from 'react';

const RecordItem = ({ record, handleDownload }) => {
    return (
        <li>
            <div className='info-part'>
                <div>
                    Sinh viên: {record.student_id}
                </div>
                <div>
                    Môn: {record.subject}
                </div>
                <div>
                    Điểm: {record.grade}
                </div>
                <div>
                    Học kỳ: {record.semester}
                </div>
            </div>
            <div className='btn-part'>
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
            </div>
        </li>
    );
};

export default RecordItem;