const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb, dbPrepare } = require('../db/schema');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// GET /api/users - List users (admin only)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        await getDb();
        const users = await dbPrepare(`
      SELECT id, username, email, role, full_name, is_active, created_at, updated_at 
      FROM users ORDER BY created_at DESC
    `).all();
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/users - Create user (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        const { username, email, password, role = 'user', full_name } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password required' });
        }

        await getDb();
        const existing = await dbPrepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
        if (existing) return res.status(409).json({ error: 'Username or email already exists' });

        const id = uuidv4();
        const password_hash = bcrypt.hashSync(password, 10);

        await dbPrepare(`
      INSERT INTO users (id, username, email, password_hash, role, full_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, username, email, password_hash, role, full_name || username);

        logAudit(req.user.id, req.user.username, 'USER_CREATE', 'user', id,
            JSON.stringify({ username, role }), req.ip);

        res.status(201).json({ id, username, email, role, full_name: full_name || username });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        const { role, is_active, full_name } = req.body;
        await getDb();

        const user = await dbPrepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const updates = [];
        const params = [];

        if (role !== undefined) { updates.push('role = ?'); params.push(role); }
        if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
        if (full_name !== undefined) { updates.push('full_name = ?'); params.push(full_name); }

        if (updates.length === 0) return res.status(400).json({ error: 'No updates provided' });

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(req.params.id);

        await dbPrepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

        logAudit(req.user.id, req.user.username, 'USER_UPDATE', 'user', req.params.id,
            JSON.stringify({ role, is_active }), req.ip);

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        await getDb();
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const result = await dbPrepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'User not found' });

        logAudit(req.user.id, req.user.username, 'USER_DELETE', 'user', req.params.id, null, req.ip);

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
