// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../configs/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middlewares/auth');

// POST: Đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu sai' });
        }

        // Kiểm tra mật khẩu
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu sai' });
        }

        // Tạo JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Lỗi login:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// GET: Lấy thông tin user từ token
router.get('/me', requireAuth, (req, res) => {
    res.json({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
    });
});

module.exports = router;