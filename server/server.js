const express = require('express');

const { Pool } = require('pg');

// nạp cors, cho phép frontend gọi API
const cors = require('cors');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

//middleware
//áp dụng middleware cors cho express, cho phép xử lý các yêu cầu cross-origin cho all các tuyến đường
app.use(cors());
//áp dụng middleware json để ptich cú pháp nd json, khiến chúng có sẵn trong req.body
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

//ktra kết nối database
pool.connect((err, client, release) => {
    if (err) {
        return console.error('lỗi kết nối postreSQL: ', err.stack);
    }
    console.log('kết nối postgresql thành công');
    release();
})

//api cơ bản để test
app.get('/api/test', async (req, res) => {
    try {
        const result = await pool.query('select * from records');
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'lỗi server' });
    }
});

//thêm post record mới
app.post('/api/test', async (req, res) => {
    try {
        const { student_id, subject, grade, semester } = req.body;
        const result = await pool.query(
            'insert into records (student_id, subject, grade, semester) values ($1, $2, $3, $4) returning *',
            [student_id, subject, grade, semester]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('lỗi khi thêm: ', err.stack);
        res.status(500).json({err: 'Lỗi server'});
    }
});


app.listen(port, () => {
    console.log(`Server đang chạy trên http://localhost:${port}`);
})