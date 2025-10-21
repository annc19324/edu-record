let ipfs;

const initIPFS = async () => {
    const { create } = await import('ipfs-http-client');
    const ipfsConfig = {
        host: process.env.IPFS_HOST || '127.0.0.1',
        port: process.env.IPFS_PORT,
        protocol: process.env.IPFS_PROTOCOL,
    };
    ipfs = create(ipfsConfig);
    console.log('IPFS được khởi tạo thành công!');
    return ipfs;
};

module.exports = { initIPFS };