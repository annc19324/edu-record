import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    student_id: '',
    subject: '',
    grade: '',
    semester: ''
  });
  const [file, setFile] = useState(null);

  // Hàm lấy danh sách hồ sơ từ API
  const fetchRecords = () => {
    fetch('http://localhost:5000/api/test')
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error('Lỗi khi lấy dữ liệu:', err));
  };

  // Gọi API khi component được render
  useEffect(() => {
    fetchRecords();
  }, []);

  // Xử lý thay đổi input trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý thay đổi tệp
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('student_id', formData.student_id);
    data.append('subject', formData.subject);
    data.append('grade', formData.grade);
    data.append('semester', formData.semester);
    if (file) {
      data.append('file', file);
    }

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: data
      });
      if (res.ok) {
        const result = await res.json();
        setRecords([...records, result.record]);
        setFormData({ student_id: '', subject: '', grade: '', semester: '' });
        setFile(null);
        fetchRecords();
        alert('Thêm hồ sơ thành công');
      } else {
        alert('Lỗi khi thêm hồ sơ');
      }
    } catch (err) {
      console.error('Lỗi khi gửi dữ liệu:', err);
      alert('Lỗi server');
    }
  };

  // hàm xử lý tải xuống tệp từ IPFS
  const handleDownload = async (ipfs_hash, fileName) => {
    try {
      // gửi yêu cầu lấy tệp từ IPFS qua url localhost
      const response = await fetch(`http://localhost:8080/ipfs/${ipfs_hash}`);
      // nếu yêu cầu không thành công
      if (!response.ok) {
        // ném lỗi
        throw new Error('Lỗi tải tệp');
      }
      // chuyển đổi phản hồi thành blon (dữ liệu nhị phân)
      const blob = await response.blob();
      // tạo url tạm thời từ blob để tải xuống
      const url = window.URL.createObjectURL(blob);
      // tạo thẻ a để kích hoạt tải xuống
      const a = document.createElement('a');
      // gán url tạm thời cho href của thẻ a
      a.href = url;
      // đặt tên tệp tải xuống
      a.download = fileName;
      // thêm thẻ a vào body
      document.body.appendChild(a);
      // tự động kích hoạt sự kiện click để tải xuống
      a.click();
      // gỡ bỏ thẻ a khỏi body
      a.remove();
    } catch (err) {
      console.log('Lỗi khi tải tệp:', err);
      alert('Lỗi khi tải tệp. kiểm tra kêt nối IPFS');
    }
  }

  return (
    <div className='App'>
      <h1>Quản lý hồ sơ học tập</h1>
      <h2>Thêm hồ sơ</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mã sinh viên: </label>
          <input
            type='text'
            name='student_id'
            value={formData.student_id}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Môn học: </label>
          <input
            type='text'
            name='subject'
            value={formData.subject}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Điểm: </label>
          <input
            type='number'
            name='grade'
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
            type='text'
            name='semester'
            value={formData.semester}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Tệp PDF: </label>
          <input
            type='file'
            accept='application/pdf'
            onChange={handleFileChange}
          />
        </div>
        <button type='submit'>Thêm hồ sơ</button>
      </form>
      <h2>Danh sách</h2>
      {records.length === 0 ? (
        <p>chưa có dữ liệu</p>
      ) : (
        <ul
          style={{ listStyleType: 'none', paddingLeft: '30%', textAlign: 'left' }}
        >
          {records.map(record => (
            <li key={record.id}>
              Sinh viên: {record.student_id} | Môn: {record.subject} |
              Điểm: {record.grade} | Học kỳ: {record.semester} |
              Hash: {record.ipfs_hash ? (
                <a
                  style={{ color: 'blue', textDecoration: 'none' }}
                  href={`http://localhost:8080/ipfs/${record.ipfs_hash}`}
                  target='_blank'
                  rel='noopener noreferrer'>
                  Xem pdf
                </a>
              ) : 'N/A'}

              {/* Hash: {record.ipfs_hash || 'N/A'} */}
              {' | '}{record.ipfs_hash ? (
                <button
                  onClick={() => {
                    handleDownload(record.ipfs_hash, `bang_diem_${record.student_id}.pdf`)
                  }}
                >
                  Tải xuống
                </button>
              ) : ''}

            </li>
          ))}
        </ul>
      )
      }
    </div >
  );
}

export default App;