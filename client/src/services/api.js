export const fetchRecords = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/test');
        if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu');
        return await res.json();
    } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err);
        throw err;
    }
};

export const uploadRecord = async (formData, file) => {
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
            body: data,
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Lỗi khi thêm hồ sơ');
        }
        return await res.json();
    } catch (err) {
        console.error('Lỗi khi gửi dữ liệu:', err);
        throw err;
    }
};

export const downloadFile = async (ipfs_hash, fileName) => {
    try {
        const response = await fetch(`http://localhost:8080/ipfs/${ipfs_hash}`);
        if (!response.ok) throw new Error('Lỗi tải tệp');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (err) {
        console.error('Lỗi khi tải tệp:', err);
        throw err;
    }
};