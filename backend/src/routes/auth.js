const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb, dbPrepare } = require('../db/schema');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, full_name } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        await getDb();
        const existing = await dbPrepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
        if (existing) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const id = uuidv4();
        const password_hash = bcrypt.hashSync(password, 10);

        await dbPrepare(`
      INSERT INTO users (id, username, email, password_hash, role, full_name)
      VALUES (?, ?, ?, ?, 'user', ?)
    `).run(id, username, email, password_hash, full_name || username);

        const user = { id, username, email, role: 'user', full_name: full_name || username };
        const token = generateToken(user);

        logAudit(id, username, 'USER_REGISTER', 'user', id, null, req.ip);

        res.status(201).json({ user, token });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        await getDb();
        const user = await dbPrepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        const token = generateToken(user);
        const { password_hash, ...safeUser } = user;

        logAudit(user.id, user.username, 'USER_LOGIN', 'user', user.id, null, req.ip);

        res.json({ user: safeUser, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
