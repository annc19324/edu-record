// server/routes/records.js
const express = require('express');
const router = express.Router();
const pool = require('../configs/database');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// GET: Lấy danh sách hồ sơ (mới nhất ở đầu)
router.get('/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM records ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Lỗi lấy danh sách hồ sơ:', err.stack);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// POST: Thêm hồ sơ + upload PDF lên IPFS
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { student_id, subject, grade, semester } = req.body;
        let ipfs_hash = null;

        if (req.file) {
            const ipfs = req.app.locals.ipfs;
            if (!ipfs) {
                return res.status(503).json({ error: 'IPFS chưa sẵn sàng' });
            }

            try {
                await ipfs.id(); // Kiểm tra kết nối
            } catch (err) {
                console.error('IPFS không hoạt động:', err);
                return res.status(503).json({ error: 'IPFS Desktop chưa được bật' });
            }

            const { buffer, originalname } = req.file;
            const result = await ipfs.add({ content: buffer, path: originalname });
            ipfs_hash = result.cid.toString();
            console.log(`PDF uploaded to IPFS: ${ipfs_hash}`);
        }

        const query = `
      INSERT INTO records (student_id, subject, grade, semester, ipfs_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
        const values = [student_id, subject, grade, semester, ipfs_hash];
        const { rows } = await pool.query(query, values);

        res.status(201).json({ record: rows[0] });
    } catch (err) {
        console.error('Lỗi upload hồ sơ:', err.stack);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;