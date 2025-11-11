// server/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const recordsRoutes = require('./routes/records');
const ipfsRoutes = require('./routes/ipfs');
const { initIPFS } = require('./configs/ipfs');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', recordsRoutes);     // /api/test, /api/upload
app.use('/api/ipfs', ipfsRoutes);   // /api/ipfs/:cid

app.listen(port, async () => {
    try {
        const ipfs = await initIPFS();
        app.locals.ipfs = ipfs;
        console.log(`Server chạy tại http://localhost:${port}`);
    } catch (err) {
        console.error('Lỗi khởi tạo IPFS:', err);
        process.exit(1);
    }
});