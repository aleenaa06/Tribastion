const express = require('express');
const { getDb, dbPrepare } = require('../db/schema');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/audit - Get audit logs (admin only)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        await getDb();
        const { page = 1, limit = 50, action, user_id, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT * FROM audit_logs';
        const params = [];
        const conditions = [];

        if (action) { conditions.push('action = ?'); params.push(action); }
        if (user_id) { conditions.push('user_id = ?'); params.push(user_id); }
        if (search) {
            conditions.push('(username LIKE ? OR action LIKE ? OR details LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const logs = dbPrepare(query).all(...params);

        let countQuery = 'SELECT COUNT(*) as total FROM audit_logs';
        if (conditions.length > 0) countQuery += ' WHERE ' + conditions.join(' AND ');
        const countParams = params.slice(0, params.length - 2);
        const countResult = dbPrepare(countQuery).get(...countParams);
        const total = countResult ? countResult.total : 0;

        res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) {
        console.error('Audit logs error:', err);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

module.exports = router;
