const { dbPrepare } = require('../db/schema');
const { v4: uuidv4 } = require('uuid');

function logAudit(userId, username, action, resourceType, resourceId, details, ipAddress) {
    // Fire and forget - never throw, never await
    dbPrepare(`
      INSERT INTO audit_logs (id, user_id, username, action, resource_type, resource_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), userId, username, action, resourceType, resourceId, details, ipAddress)
        .catch(err => console.error('Audit log error:', err.message));
}

module.exports = { logAudit };
