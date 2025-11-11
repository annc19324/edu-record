// server/migrate.js
const pool = require('./configs/database'); // DÙNG CHUNG
const bcrypt = require('bcrypt');

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '12345';
const ADMIN_ROLE = 'ADMIN';

async function migrate() {
    console.log('Bắt đầu migration...');

    try {
        // 1. Tạo bảng users
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Bảng "users" đã sẵn sàng');

        // 2. Tạo bảng records
        await pool.query(`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(11) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        grade DECIMAL(3,1) NOT NULL,
        semester VARCHAR(20) NOT NULL,
        ipfs_hash VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Bảng "records" đã sẵn sàng');

        // 3. Tạo admin nếu chưa có
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [ADMIN_EMAIL]);
        if (rows.length > 0) {
            console.log(`Admin đã tồn tại: ${ADMIN_EMAIL}`);
        } else {
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await pool.query(
                `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4)`,
                ['Admin Blockchain', ADMIN_EMAIL, hashedPassword, ADMIN_ROLE]
            );
            console.log(`Tài khoản ADMIN đã được tạo:`);
            console.log(`   Email: ${ADMIN_EMAIL}`);
            console.log(`   Mật khẩu: ${ADMIN_PASSWORD}`);
            console.log(`   Role: ${ADMIN_ROLE}`);
        }

        console.log('Migration hoàn tất thành công!');
    } catch (err) {
        console.error('Lỗi migration:', err.stack);
    } finally {
        // Không đóng pool ở đây → server.js sẽ dùng tiếp
        console.log('Migration kết thúc. Pool vẫn mở cho server.');
    }
}

migrate();