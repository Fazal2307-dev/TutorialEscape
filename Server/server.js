const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Add password if set in MySQL
    database: 'form_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection on startup
pool.getConnection()
    .then(connection => {
        console.log('✅ Successfully connected to MySQL database!');
        connection.release();
    })
    .catch(error => {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    });

// Form submission endpoint
app.post('/submit', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { name, email, message } = req.body;

        // Validate inputs
        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Insert into database
        const [result] = await connection.query(
            'INSERT INTO submissions (name, email, message) VALUES (?, ?, ?)',
            [name.trim(), email.trim(), message.trim()]
        );

        res.status(201).json({
            success: true,
            message: 'Submission saved successfully!',
            id: result.insertId
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: error.message // Send actual error message
        });
    } finally {
        if (connection) connection.release();
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});