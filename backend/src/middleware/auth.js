const jwt = require('jsonwebtoken');
const { getDb, dbPrepare } = require('../db/schema');

const JWT_SECRET = process.env.JWT_SECRET || 'tribastion_secure_jwt_secret_key_2024';

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        await getDb(); // ensure db is ready
        const user = await dbPrepare('SELECT id, username, email, role, full_name, is_active FROM users WHERE id = ?').get(decoded.userId);

        if (!user || !user.is_active) {
            return res.status(401).json({ error: 'User not found or inactive' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

function generateToken(user) {
    return jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

module.exports = { authenticateToken, requireRole, generateToken };
