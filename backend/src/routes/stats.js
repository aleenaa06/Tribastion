const express = require('express');
const { getDb, dbPrepare } = require('../db/schema');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/stats - Dashboard statistics
router.get('/', authenticateToken, async (req, res) => {
  try {
    await getDb();

    const totalFiles = (dbPrepare('SELECT COUNT(*) as count FROM files').get() || {}).count || 0;
    const completedFiles = (dbPrepare("SELECT COUNT(*) as count FROM files WHERE status = 'completed'").get() || {}).count || 0;
    const processingFiles = (dbPrepare("SELECT COUNT(*) as count FROM files WHERE status = 'processing'").get() || {}).count || 0;
    const failedFiles = (dbPrepare("SELECT COUNT(*) as count FROM files WHERE status = 'failed'").get() || {}).count || 0;
    const totalPii = (dbPrepare('SELECT COUNT(*) as count FROM pii_detections').get() || {}).count || 0;
    const totalUsers = (dbPrepare('SELECT COUNT(*) as count FROM users').get() || {}).count || 0;

    const piiByType = dbPrepare(`
      SELECT pii_type, COUNT(*) as count 
      FROM pii_detections 
      GROUP BY pii_type 
      ORDER BY count DESC
    `).all();

    const filesByType = dbPrepare(`
      SELECT file_type, COUNT(*) as count 
      FROM files 
      GROUP BY file_type 
      ORDER BY count DESC
    `).all();

    const recentFiles = dbPrepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM files 
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all();

    const byMethod = dbPrepare(`
      SELECT sanitization_method, COUNT(*) as count 
      FROM files 
      WHERE status = 'completed'
      GROUP BY sanitization_method
    `).all();

    const avgProcessing = dbPrepare(`
      SELECT AVG(processing_time_ms) as avg_time 
      FROM files WHERE status = 'completed'
    `).get();

    res.json({
      overview: {
        totalFiles,
        completedFiles,
        processingFiles,
        failedFiles,
        totalPii,
        totalUsers,
        avgProcessingTime: Math.round((avgProcessing && avgProcessing.avg_time) || 0)
      },
      piiByType,
      filesByType,
      recentFiles,
      byMethod
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
