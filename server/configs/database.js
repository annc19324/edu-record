const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Lỗi kết nối PostgreSQL:', err.stack);
    return;
  }
  console.log('Kết nối PostgreSQL thành công!');
  release();
});

module.exports = pool;