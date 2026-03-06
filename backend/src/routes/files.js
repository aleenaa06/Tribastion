const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb, dbPrepare, saveDb } = require('../db/schema');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');
const { parseFile } = require('../services/fileParser');
const { detectPii } = require('../services/piiService');
const { sanitizeText } = require('../services/sanitizer');

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

// POST /api/files/upload - Admin only
router.post('/upload', authenticateToken, requireRole('admin'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const sanitizationMethod = req.body.sanitization_method || 'redaction';
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
        console.error('Upload error:', err);
        res.status(500).json({ error: 'File upload failed' });
    }
});

async function processFile(fileId, filePath, mimeType, method, user) {
    const startTime = Date.now();

    try {
        const originalText = await parseFile(filePath, mimeType);
        const detections = await detectPii(originalText);
        const { sanitizedText, appliedMasks } = sanitizeText(originalText, detections, method);

        const sanitizedFileName = `sanitized_${path.basename(filePath, path.extname(filePath))}.txt`;
        const sanitizedPath = path.join(sanitizedDir, sanitizedFileName);
        fs.writeFileSync(sanitizedPath, sanitizedText);

        // Store PII detections
        for (const mask of appliedMasks) {
            await dbPrepare(`
        INSERT INTO pii_detections (id, file_id, pii_type, original_value, masked_value, start_position, end_position, confidence, detection_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(mask.id, fileId, mask.type, mask.original, mask.masked, mask.start, mask.end, mask.confidence, mask.method);
        }

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
        console.error('Processing error:', err);
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

        if (status) { conditions.push('f.status = ?'); params.push(status); }
        if (search) { conditions.push('f.original_name LIKE ?'); params.push(`%${search}%`); }
        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');

        query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const files = await dbPrepare(query).all(...params);

        let countQuery = 'SELECT COUNT(*) as total FROM files';
        const countParams = [];
        if (status) { countQuery += ' WHERE status = ?'; countParams.push(status); }
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
        if (file.status !== 'completed') return res.status(400).json({ error: 'File not yet processed' });

        const downloadPath = file.sanitized_path;
        if (!downloadPath || !fs.existsSync(downloadPath)) {
            return res.status(404).json({ error: 'Sanitized file not found' });
        }

        logAudit(req.user.id, req.user.username, 'FILE_DOWNLOAD', 'file', req.params.id,
            JSON.stringify({ filename: file.original_name }), req.ip);

        res.download(downloadPath, `sanitized_${file.original_name.replace(path.extname(file.original_name), '.txt')}`);
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
        if (!fs.existsSync(file.original_path)) return res.status(404).json({ error: 'Original file not found' });

        logAudit(req.user.id, req.user.username, 'FILE_DOWNLOAD_ORIGINAL', 'file', req.params.id,
            JSON.stringify({ filename: file.original_name }), req.ip);

        res.download(file.original_path, file.original_name);
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

module.exports = router;
