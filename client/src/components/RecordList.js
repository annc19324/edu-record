import React from 'react';
import RecordItem from './RecordItem';

const RecordList = ({ records, handleDownload }) => {
    return (
        <div>
            <h2>Danh sách</h2>
            {records.length === 0 ? (
                <p>Chưa có dữ liệu</p>
            ) : (
                <ul style={{ listStyleType: 'none', paddingLeft: '0%', textAlign: 'center' }}>
                    {records.map(record => (
                        <RecordItem key={record.id} record={record} handleDownload={handleDownload} />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RecordList;