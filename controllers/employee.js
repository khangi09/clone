const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const requireRole = require('../middleware/requireRole');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.PG_CONN });

// ===== Login Route =====
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send token in HTTP-only cookie
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Logged in' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== Protected Employee Routes =====
router.use(requireRole('employee'));

// List pending payments
router.get('/pending-payments', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, beneficiary_name, amount, currency FROM payments WHERE status=$1',
      ['pending']
    );
    res.json({ payments: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve payment
router.post('/approve/:id', async (req, res) => {
  const id = req.params.id;
  if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid ID' });

  try {
    await pool.query(
      'UPDATE payments SET status=$1, approved_by=$2, approved_at=NOW() WHERE id=$3',
      ['approved', req.user.id, id]
    );
    res.json({ message: 'Approved' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

