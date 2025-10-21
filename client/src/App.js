import React, { useEffect, useState } from 'react';
import './App.css';
import RecordForm from './components/RecordForm';
import RecordList from './components/RecordList';
import { fetchRecords, uploadRecord, downloadFile } from './services/api';

function App() {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    student_id: '',
    subject: '',
    grade: '',
    semester: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchRecords()
      .then(data => setRecords(data))
      .catch(() => alert('Lỗi khi tải danh sách hồ sơ'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await uploadRecord(formData, file);
      setRecords([...records, result.record]);
      setFormData({ student_id: '', subject: '', grade: '', semester: '' });
      setFile(null);
      alert('Thêm hồ sơ thành công');
      fetchRecords().then(data => setRecords(data));
    } catch (err) {
      const errorMessage = err.message.includes('IPFS')
        ? err.message
        : 'Lỗi khi thêm hồ sơ. Vui lòng kiểm tra lại.';
      alert(errorMessage);
    }
  };

  const handleDownload = async (ipfs_hash, fileName) => {
    try {
      await downloadFile(ipfs_hash, fileName);
    } catch (err) {
      alert('Lỗi khi tải tệp. Kiểm tra kết nối IPFS');
    }
  };

  return (
    <div className="App">
      <h1>Quản lý hồ sơ học tập</h1>
      <RecordForm
        formData={formData}
        setFormData={setFormData}
        file={file}
        setFile={setFile}
        handleSubmit={handleSubmit}
      />
      <RecordList records={records} handleDownload={handleDownload} />
    </div>
  );
}

export default App;