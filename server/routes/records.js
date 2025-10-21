const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM records');
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/records', async (req, res) => {
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

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { student_id, subject, grade, semester } = req.body;
        let ipfs_hash = null;

        if (req.file) {
            const ipfs = req.app.locals.ipfs;
            if (!ipfs) {
                return res.status(503).json({ error: 'IPFS chưa được khởi tạo' });
            }

            // Kiểm tra trạng thái IPFS
            try {
                await ipfs.id(); // Gọi hàm id để kiểm tra kết nối
            } catch (err) {
                console.error('IPFS không hoạt động:', err);
                return res.status(503).json({ error: 'IPFS Desktop chưa được bật hoặc không thể kết nối.' });
            }

            const file = {
                content: req.file.buffer,
                path: req.file.originalname,
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

module.exports = router;