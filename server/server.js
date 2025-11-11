// server/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Import routes
const recordsRoutes = require('./routes/records');
const authRoutes = require('./routes/auth.routes'); // THÊM DÒNG NÀY
const ipfsRoutes = require('./routes/ipfs');
const { initIPFS } = require('./configs/ipfs');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', recordsRoutes);        // /api/test, /api/upload
app.use('/api/auth', authRoutes);      // THÊM: /api/auth/login, /api/auth/me
app.use('/api/ipfs', ipfsRoutes);      // /api/ipfs/:cid

// Khởi chạy
// server/server.js
app.listen(port, async () => {
    try {
        const { ipfs, testConnection } = await initIPFS();
        await testConnection(); // Kiểm tra ngay
        app.locals.ipfs = ipfs;
        console.log(`Server chạy tại http://localhost:${port}`);
    } catch (err) {
        console.error('Lỗi khởi tạo IPFS:', err.message);
        process.exit(1);
    }
});