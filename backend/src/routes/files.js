const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb, dbPrepare, saveDb } = require('../db/schema');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');
const { processAndSanitize } = require('../services/fileProcessor');
const { parseFile } = require('../services/fileParser');

const router = express.Router();

// Configure multer storage
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const sanitizedDir = path.join(__dirname, '..', '..', 'sanitized');

[uploadsDir, sanitizedDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const allowedExtensions = ['.pdf', '.docx', '.txt', '.csv', '.json', '.sql', '.jpg', '.jpeg', '.png'];
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${ext} not supported. Allowed: ${allowedExtensions.join(', ')}`));
        }
    }
});

// POST /api/files/upload - Any authenticated user
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const sanitizationMethod = req.body.method || req.body.sanitization_method || 'redaction';
        const fileId = uuidv4();
        await getDb();

        await dbPrepare(`
      INSERT INTO files (id, original_name, stored_name, file_type, file_size, mime_type, uploaded_by, status, original_path, sanitization_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'processing', ?, ?)
    `).run(
            fileId,
            req.file.originalname,
            req.file.filename,
            path.extname(req.file.originalname).toLowerCase().substring(1),
            req.file.size,
            req.file.mimetype,
            req.user.id,
            req.file.path,
            sanitizationMethod
        );

        logAudit(req.user.id, req.user.username, 'FILE_UPLOAD', 'file', fileId,
            JSON.stringify({ filename: req.file.originalname, size: req.file.size }), req.ip);

        // Process file asynchronously
        processFile(fileId, req.file.path, req.file.mimetype, sanitizationMethod, req.user)
            .catch(err => console.error('File processing error:', err));

        res.status(201).json({
            id: fileId,
            filename: req.file.originalname,
            status: 'processing',
            message: 'File uploaded and processing started'
        });
    } catch (err) {
        console.error('Upload Error (Detailed):', err.message, err.stack);
        res.status(500).json({ error: 'File upload failed', details: err.message });
    }
});

async function processFile(fileId, filePath, mimeType, method, user) {
    const startTime = Date.now();

    try {
        // Using the new modular fileProcessor for format preservation
        const sanitizedFileName = `sanitized_${path.basename(filePath)}`;
        const sanitizedPath = path.join(sanitizedDir, sanitizedFileName);

        await processAndSanitize(filePath, sanitizedPath, mimeType, method);

        // We aren't capturing individual masked strings from the python scripts for DB right now 
        // to simplify the flow and focus on format preservation. 
        // We will just store the counts as 1 for auditing purposes, or we could refactor python 
        // scripts to return stats. For now, empty or mock array to keep DB happy.
        const appliedMasks = [];

        // Extract text for frontend preview
        let originalText = await parseFile(filePath, mimeType);
        let sanitizedText = await parseFile(sanitizedPath, mimeType);

        // If image, just store a placeholder or whatever parseFile returns
        if (!originalText) originalText = "Preview not available.";
        if (!sanitizedText) sanitizedText = "Preview not available.";


        const processingTime = Date.now() - startTime;

        await dbPrepare(`
      UPDATE files SET
        status = 'completed',
        sanitized_path = ?,
        original_text = ?,
        sanitized_text = ?,
        pii_count = ?,
        processing_time_ms = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(sanitizedPath, originalText, sanitizedText, appliedMasks.length, processingTime, fileId);

        logAudit(user.id, user.username, 'PII_DETECTION', 'file', fileId,
            JSON.stringify({ pii_count: appliedMasks.length, processing_time_ms: processingTime, method }), null);

    } catch (err) {
        console.error('Processing/Sanitization Error (Detailed):', err.message, err.stack);
        await dbPrepare(`UPDATE files SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(fileId);
    }
}

// GET /api/files - List files
router.get('/', authenticateToken, async (req, res) => {
    try {
        await getDb();
        const { search, status, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT f.id, f.original_name, f.file_type, f.file_size, f.status, f.pii_count, f.sanitization_method, f.processing_time_ms, f.created_at, f.updated_at, u.username as uploaded_by_name FROM files f JOIN users u ON f.uploaded_by = u.id';
        const params = [];
        const conditions = [];

        if (req.user.role !== 'admin') { conditions.push('f.uploaded_by = ?'); params.push(req.user.id); }
        if (status) { conditions.push('f.status = ?'); params.push(status); }
        if (search) { conditions.push('f.original_name LIKE ?'); params.push(`%${search}%`); }
        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');

        query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const files = await dbPrepare(query).all(...params);

        let countQuery = 'SELECT COUNT(*) as total FROM files';
        const countParams = [];
        const countConditions = [];

        if (req.user.role !== 'admin') { countConditions.push('uploaded_by = ?'); countParams.push(req.user.id); }
        if (status) { countConditions.push('status = ?'); countParams.push(status); }

        if (countConditions.length > 0) countQuery += ' WHERE ' + countConditions.join(' AND ');

        const countResult = await dbPrepare(countQuery).get(...countParams);
        const total = countResult ? countResult.total : 0;

        res.json({ files, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) {
        console.error('List files error:', err);
        res.status(500).json({ error: 'Failed to list files' });
    }
});

// GET /api/files/:id - Get file details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        await getDb();
        const file = await dbPrepare(`
      SELECT f.*, u.username as uploaded_by_name 
      FROM files f JOIN users u ON f.uploaded_by = u.id 
      WHERE f.id = ?
    `).get(req.params.id);

        if (!file) return res.status(404).json({ error: 'File not found' });

        if (req.user.role !== 'admin' && file.uploaded_by !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (req.user.role !== 'admin') {
            delete file.original_text;
            delete file.original_path;
        }

        const detections = await dbPrepare('SELECT * FROM pii_detections WHERE file_id = ? ORDER BY start_position').all(req.params.id);

        if (req.user.role !== 'admin') {
            detections.forEach(d => { delete d.original_value; });
        }

        logAudit(req.user.id, req.user.username, 'FILE_VIEW', 'file', req.params.id, null, req.ip);

        res.json({ file, detections });
    } catch (err) {
        console.error('Get file error:', err);
        res.status(500).json({ error: 'Failed to get file details' });
    }
});

// GET /api/files/:id/download - Download sanitized file
router.get('/:id/download', authenticateToken, async (req, res) => {
    try {
        await getDb();
        const file = await dbPrepare('SELECT * FROM files WHERE id = ?').get(req.params.id);

        if (!file) return res.status(404).json({ error: 'File not found' });
        if (req.user.role !== 'admin' && file.uploaded_by !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (file.status !== 'completed') return res.status(400).json({ error: 'File not yet processed' });

        // Reconstruct the path using basename to avoid cross-platform absolute path issues (e.g. C:\Users\... on a Linux server)
        const filename = path.basename(file.sanitized_path || '');
        const downloadPath = filename ? path.join(__dirname, '..', '..', 'sanitized', filename) : '';

        if (!downloadPath || !fs.existsSync(downloadPath)) {
            return res.status(404).json({ error: 'Sanitized file not found on the server' });
        }

        logAudit(req.user.id, req.user.username, 'FILE_DOWNLOAD', 'file', req.params.id,
            JSON.stringify({ filename: file.original_name }), req.ip);

        const originalExt = path.extname(file.original_name);
        const nameWithoutExt = file.original_name.replace(originalExt, '');
        res.download(downloadPath, `sanitized_${nameWithoutExt}.txt`);
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Download failed' });
    }
});

// GET /api/files/:id/original - Download original (admin only)
router.get('/:id/original', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        await getDb();
        const file = await dbPrepare('SELECT * FROM files WHERE id = ?').get(req.params.id);

        if (!file) return res.status(404).json({ error: 'File not found' });
        const filename = path.basename(file.original_path || '');
        const downloadPath = filename ? path.join(__dirname, '..', '..', 'uploads', filename) : '';

        if (!downloadPath || !fs.existsSync(downloadPath)) return res.status(404).json({ error: 'Original file not found on the server' });

        logAudit(req.user.id, req.user.username, 'FILE_DOWNLOAD_ORIGINAL', 'file', req.params.id,
            JSON.stringify({ filename: file.original_name }), req.ip);

        res.download(downloadPath, file.original_name);
    } catch (err) {
        console.error('Original download error:', err);
        res.status(500).json({ error: 'Download failed' });
    }
});

// DELETE /api/files/:id - Admin only
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        await getDb();
        const file = await dbPrepare('SELECT * FROM files WHERE id = ?').get(req.params.id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        if (file.original_path && fs.existsSync(file.original_path)) fs.unlinkSync(file.original_path);
        if (file.sanitized_path && fs.existsSync(file.sanitized_path)) fs.unlinkSync(file.sanitized_path);

        await dbPrepare('DELETE FROM pii_detections WHERE file_id = ?').run(req.params.id);
        await dbPrepare('DELETE FROM files WHERE id = ?').run(req.params.id);

        logAudit(req.user.id, req.user.username, 'FILE_DELETE', 'file', req.params.id,
            JSON.stringify({ filename: file.original_name }), req.ip);

        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// POST /api/files/sanitize - Direct sanitization endpoint
router.post('/sanitize', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const sanitizationMethod = req.body.method || req.body.sanitization_method || 'redaction';
        console.log("Sanitization method:", sanitizationMethod);
        const sanitizedFileName = `sanitized_${req.file.originalname}`;
        const sanitizedPath = path.join(sanitizedDir, sanitizedFileName);

        try {
            await processAndSanitize(req.file.path, sanitizedPath, req.file.mimetype, sanitizationMethod);

            res.download(sanitizedPath, sanitizedFileName, (err) => {
                // Optionally clean up files after download
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                if (fs.existsSync(sanitizedPath)) fs.unlinkSync(sanitizedPath);
            });
        } catch (procErr) {
            console.error('Direct sanitization processing error:', procErr);
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            res.status(500).json({ error: 'File processing failed', details: procErr.message });
        }
    } catch (err) {
        console.error('Direct sanitize error:', err);
        res.status(500).json({ error: 'Direct sanitization failed' });
    }
});

module.exports = router;
