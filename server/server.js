const express = require('express');

const { Pool } = require('pg');

// nạp cors, cho phép frontend gọi API
const cors = require('cors');
// nạp multer để xử lý tệp
const multer = require('multer');

// cấu hình multer để xử lý tệp
const upload = multer({ storage: multer.memoryStorage() });

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
//áp dụng middleware cors cho express, cho phép xử lý các yêu cầu cross-origin cho all các tuyến đường
app.use(cors());
//áp dụng middleware json để ptich cú pháp nd json, khiến chúng có sẵn trong req.body
app.use(express.json());

//cấu hình ipfs với dynamic import
let ipfs;
const initIPFS = async () => {
    const { create } = await import('ipfs-http-client');
    const ipfsConfig = {
        host: process.env.IPFS_HOST,
        port: process.env.IPFS_PORT,
        protocol: process.env.IPFS_PROTOCOL,
    };
    ipfs = create(ipfsConfig);
    console.log('IPFS được khởi tạo thành công!');
}

//api kiểm tra kết nối IPFS
app.get('/api/ipfs-test', async (req, res) => {
    try {
        if (!ipfs) {
            return res.status(503).json({ err: 'IPFS chưa được khởi tạo' });
        }
        const ver = await ipfs.version();
        res.json({ mes: 'kết nối IPFS thành công', ver });
    } catch (err) {
        console.error('Lỗi kết nối IPFS: ', err);
        res.status(500).json({ err: 'Lỗi kết nối IPFS' });
    }
});

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

//ktra kết nối database
pool.connect((err, client, release) => {
    if (err) {
        return console.error('lỗi kết nối postreSQL: ', err.stack);
    }
    console.log('kết nối postgresql thành công');
    release();
})

//api cơ bản để test
app.get('/api/test', async (req, res) => {
    try {
        const result = await pool.query('select * from records');
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'lỗi server' });
    }
});

//thêm post record mới
app.post('/api/test', upload.single('file'), async (req, res) => {
    try {
        const { student_id, subject, grade, semester } = req.body;
        let ipfs_hash = null;

        if (req.file) {
            if (!ipfs) {
                return res.status(503).json({ err: 'IPFS chưa được khởi tạo' });
            }
            const file = {
                content: req.file.buffer,
                path: req.file.originalname
            };
            const result = await ipfs.add(file);
            ipfs_hash = result.cid.toString();
        }

        const queryResult = await pool.query(
            'insert into records (student_id, subject, grade, semester, ipfs_hash) values ($1, $2, $3, $4, $5) returning *',
            [student_id, subject, grade, semester, ipfs_hash]
        );
        res.status(201).json(queryResult.rows[0]);
    } catch (err) {
        console.error('lỗi khi thêm: ', err.stack);
        res.status(500).json({ err: 'Lỗi server' });
    }
});


app.listen(port, async () => {
    try {
        await initIPFS();
        console.log(`Server đang chạy trên http://localhost:${port}`);
    } catch (err) {
        console.error('Lỗi khởi tạo IPFS, dừng server: ', err);
        process.exit(1);
    }
})