const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Cấu hình Multer để xử lý tệp
const upload = multer({ storage: multer.memoryStorage() });

// Cấu hình IPFS
let ipfs;
const initIPFS = async () => {
    const { create } = await import('ipfs-http-client');
    const ipfsConfig = {
        host: process.env.IPFS_HOST || '127.0.0.1',
        port: process.env.IPFS_PORT,
        protocol: process.env.IPFS_PROTOCOL
    };
    ipfs = create(ipfsConfig);
    console.log('IPFS được khởi tạo thành công!');
};

// Cấu hình PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Kiểm tra kết nối database
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Lỗi kết nối PostgreSQL:', err.stack);
    }
    console.log('Kết nối PostgreSQL thành công!');
    release();
});

// API kiểm tra kết nối IPFS
app.get('/api/ipfs-test', async (req, res) => {
    try {
        if (!ipfs) {
            return res.status(503).json({ error: 'IPFS chưa được khởi tạo' });
        }
        const version = await ipfs.version();
        res.json({ message: 'Kết nối IPFS thành công', version });
    } catch (err) {
        console.error('Lỗi kết nối IPFS:', err);
        res.status(500).json({ error: 'Lỗi kết nối IPFS' });
    }
});

// API GET để lấy danh sách hồ sơ
app.get('/api/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM records');
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API POST để thêm hồ sơ (không tệp)
app.post('/api/records', async (req, res) => {
    try {
        const { student_id, subject, grade, semester } = req.body;
        const query = `
            INSERT INTO records (student_id, subject, grade, semester)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [student_id, subject, grade, semester];
        const result = await pool.query(query, values);
        res.status(201).json({ record: result.rows[0] });
    } catch (err) {
        console.error('Lỗi khi thêm hồ sơ:', err.stack);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API POST để tải lên tệp PDF và lưu hash
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        const { student_id, subject, grade, semester } = req.body;
        let ipfs_hash = null;

        if (req.file) {
            if (!ipfs) {
                return res.status(503).json({ error: 'IPFS chưa được khởi tạo' });
            }
            const file = {
                content: req.file.buffer,
                path: req.file.originalname
            };
            const result = await ipfs.add(file);
            ipfs_hash = result.cid.toString();
        }

        const query = `
            INSERT INTO records (student_id, subject, grade, semester, ipfs_hash)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [student_id, subject, grade, semester, ipfs_hash];
        const queryResult = await pool.query(query, values);
        res.status(201).json({ record: queryResult.rows[0] });
    } catch (err) {
        console.error('Lỗi khi tải lên:', err.stack);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Khởi chạy server
app.listen(port, async () => {
    try {
        await initIPFS();
        console.log(`Server chạy tại http://localhost:${port}`);
    } catch (err) {
        console.error('Lỗi khởi tạo IPFS, dừng server:', err);
        process.exit(1);
    }
});