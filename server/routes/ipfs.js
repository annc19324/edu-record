// server/routes/ipfs.js
const express = require('express');
const router = express.Router();

// GET: Xem PDF từ IPFS (CID)
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const ipfs = req.app.locals.ipfs;

        if (!ipfs) {
            return res.status(503).send('IPFS chưa sẵn sàng. Vui lòng khởi động IPFS Desktop.');
        }

        console.log(`Truy xuất file IPFS: ${cid}`);
        const stream = ipfs.cat(cid);

        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'inline; filename="bang_diem.pdf"');

        let hasData = false;
        for await (const chunk of stream) {
            res.write(chunk);
            hasData = true;
        }

        if (!hasData) throw new Error('Không có dữ liệu từ IPFS');
        res.end();
    } catch (err) {
        console.error(`Lỗi IPFS CID ${req.params.cid}:`, err.message);
        res.status(404).send(`Không tìm thấy file trên IPFS (CID: ${req.params.cid})`);
    }
});

// Xử lý trường hợp có dấu "/" cuối URL
router.get('/:cid/', (req, res) => {
    res.redirect(301, `/api/ipfs/${req.params.cid}`);
});

module.exports = router;