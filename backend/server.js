const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

//connect database
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'pr_expensetracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


db.getConnection((err, connection) => {
    if (err) {
        console.error('========================================');
        console.error('Error connection:');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        console.error('========================================');
        return;
    }
    console.log('Success sql connection!');
    connection.release();
});

//api_signup
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Please fill in all fields!" });
    }

    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Email already used or database error." });
        }
        res.json({ success: true, message: "Registration successful!" });
    });
});

//api_login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please fill in all fields!" });
    }

    const query = 'SELECT id, name, email FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: "Email or password is incorrect!" });
        }
    });
});

//add record
app.post('/api/expenses', (req, res) => {
    const { user_id, title, amount, category, date, mood } = req.body;
    
    if (!user_id || !title || !amount) {
        return res.status(400).json({ success: false, message: "Data is incomplete." });
    }

    const query = 'INSERT INTO expenses (user_id, title, amount, category, date, mood) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [user_id, title, amount, category, date, mood], (err, result) => {
        if (err) {
            console.error("MySQL Insert Error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, id: result.insertId });
    });
});

//expenses history
app.get('/api/expenses_list', (req, res) => {
    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const query = 'SELECT id, user_id, title, amount, category, date, mood FROM expenses WHERE user_id = ? ORDER BY date DESC';
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ expenses: results });
    });
});

//update expenses
app.put('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    const { title, amount, category } = req.body;

    if (!title || !amount || !category) {
        return res.status(400).json({ success: false, message: "Data is incomplete ." });
    }

    const query = 'UPDATE expenses SET title = ?, amount = ?, category = ? WHERE id = ?';
    db.query(query, [title, amount, category, id], (err, result) => {
        if (err) {
            console.error("MySQL Update Error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Record not found." });
        }

        res.json({ success: true, message: "Record updated successfully!" });
    });
});

//delete expenses
app.delete('/api/expenses/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM expenses WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("MySQL Delete Error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Record not found." });
        }

        res.json({ success: true, message: "Record deleted successfully!" });
    });
});

//monthly report
app.get('/api/report', (req, res) => {
    const { user_id, month, year } = req.query;

    if (!user_id || !month || !year) {
        return res.status(400).json({ success: false, message: "User ID, month, and year are required." });
    }

    const query = `
        SELECT category, SUM(amount) AS total 
        FROM expenses 
        WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? 
        GROUP BY category
        ORDER BY total DESC
    `;

    db.query(query, [user_id, month, year], (err, results) => {
        if (err) {
            console.error("MySQL Report Error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: results });
    });
});

//dashboard summary
app.get('/api/dashboard', (req, res) => {
    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const queryIncome = 'SELECT income FROM users WHERE id = ?';
    const queryExpenses = 'SELECT SUM(amount) AS totalExpense FROM expenses WHERE user_id = ?';

    db.query(queryIncome, [userId], (err, incomeResults) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        db.query(queryExpenses, [userId], (err, expenseResults) => {
            if (err) return res.status(500).json({ success: false, error: err.message });

            const totalIncome = incomeResults[0]?.income || 0;
            const totalExpense = expenseResults[0]?.totalExpense || 0;

            res.json({
                totalIncome: totalIncome,
                totalExpense: totalExpense,
                financialHealth: totalIncome > totalExpense ? 'Stable' : 'Critical'
            });
        });
    });
});

//update income
app.put('/api/dashboard/update-income', (req, res) => {
    const { user_id, income } = req.body;

    if (!user_id) {
        return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const query = 'UPDATE users SET income = ? WHERE id = ?';
    db.query(query, [income, user_id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Income has been updated!" });
    });
});

//port connection
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});
