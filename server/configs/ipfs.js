// server/configs/ipfs.js
const { create } = require('ipfs-http-client');

const initIPFS = async () => {
    const config = {
        host: process.env.IPFS_HOST || '127.0.0.1',
        port: process.env.IPFS_PORT || 5001,
        protocol: process.env.IPFS_PROTOCOL || 'http',
    };

    const ipfs = create(config);

    const testConnection = async () => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`${config.protocol}://${config.host}:${config.port}/api/v0/version`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({}).toString(),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            console.log(`IPFS kết nối thành công! Version: ${data.Version}`);
            return true;
        } catch (err) {
            console.error('IPFS test thất bại:', err.message);
            throw new Error('IPFS không phản hồi');
        }
    };

    return { ipfs, testConnection };
};

module.exports = { initIPFS };