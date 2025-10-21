const express = require('express');
const cors = require('cors');
const { initIPFS } = require('./config/ipfs');
const recordRoutes = require('./routes/records');
const ipfsRoutes = require('./routes/ipfs');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', recordRoutes);
app.use('/api', ipfsRoutes);

app.listen(port, async () => {
    try {
        const ipfs = await initIPFS();
        app.locals.ipfs = ipfs;
        console.log(`Server chạy tại http://localhost:${port}`);
    } catch (err) {
        console.error('Lỗi khởi tạo IPFS, dừng server:', err);
        process.exit(1);
    }
});