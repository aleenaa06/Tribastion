require('dotenv').config();
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

let db = null;

async function getDb() {
  if (db) return db;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.warn("⚠️ TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing in .env.");
    console.warn("Falling back to local SQLite file for development.");
    db = createClient({ url: 'file:../../data/tribastion.db' });
  } else {
    db = createClient({
      url: url,
      authToken: authToken,
    });
  }

  return db;
}

// Turso does not need a periodic saveDb since it's a real database
function saveDb() {
  // No-op for compatibility with old code
}

async function initializeDatabase() {
  const d = await getDb();

  await d.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      full_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    )
  `);

  await d.execute(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT,
      uploaded_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      original_path TEXT NOT NULL,
      sanitized_path TEXT,
      original_text TEXT,
      sanitized_text TEXT,
      sanitization_method TEXT DEFAULT 'redaction',
      pii_count INTEGER DEFAULT 0,
      processing_time_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);

  await d.execute(`
    CREATE TABLE IF NOT EXISTS pii_detections (
      id TEXT PRIMARY KEY,
      file_id TEXT NOT NULL,
      pii_type TEXT NOT NULL,
      original_value TEXT,
      masked_value TEXT,
      start_position INTEGER,
      end_position INTEGER,
      confidence REAL DEFAULT 1.0,
      detection_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (file_id) REFERENCES files(id)
    )
  `);

  await d.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      username TEXT,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create indexes
  try {
    await d.execute('CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by)');
    await d.execute('CREATE INDEX IF NOT EXISTS idx_files_status ON files(status)');
    await d.execute('CREATE INDEX IF NOT EXISTS idx_pii_file_id ON pii_detections(file_id)');
    await d.execute('CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id)');
    await d.execute('CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at)');
  } catch (e) {
    // Indexes may already exist
  }

  // Seed default users
  const result = await d.execute("SELECT id FROM users WHERE username = 'admin'");
  if (result.rows.length === 0) {
    const { v4: uuidv4 } = require('uuid');
    const adminHash = bcrypt.hashSync('admin123', 10);
    await d.execute({
      sql: `INSERT INTO users (id, username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [uuidv4(), 'admin', 'admin@tribastion.com', adminHash, 'admin', 'System Administrator']
    });

    const userHash = bcrypt.hashSync('user123', 10);
    await d.execute({
      sql: `INSERT INTO users (id, username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [uuidv4(), 'user', 'user@tribastion.com', userHash, 'user', 'Standard User']
    });
  }

  console.log('✅ Turso Database initialized successfully');
  return d;
}

// Turso/libSQL client wrapper functions to maintain compatibility with existing backend code
// Since sql.js was completely synchronous, but @libsql/client is asynchronous, we need to adapt it.

function dbPrepare(sql) {
  return {
    run: async (...params) => {
      // @libsql/client execute allows positional args
      const result = await db.execute({ sql, args: params });
      return { changes: result.rowsAffected };
    },
    get: async (...params) => {
      const result = await db.execute({ sql, args: params });
      if (result.rows.length > 0) {
        // Convert Turso Row object to a plain JS object so bcrypt/destructuring works
        return Object.assign({}, result.rows[0]);
      }
      return null;
    },
    all: async (...params) => {
      const result = await db.execute({ sql, args: params });
      // Convert each Turso Row object to a plain JS object
      return result.rows.map(row => Object.assign({}, row));
    }
  };
}

async function dbExec(sql) {
  await db.execute(sql);
}

// For multi-query transactions using Turso batch or transaction APIs
function dbTransaction(fn) {
  // We mock the synchronous behavior as best as possible. 
  // IMPORTANT: Any caller using dbTransaction in the codebase might fail if they expect synchronous blocking.
  // We'll wrap it in async for Turso.
  return async () => {
    // Turso provides a transaction method
    const transaction = await db.transaction('write');
    try {
      // Because `fn` calls `dbPrepare(...).run()`, but `run` is now async,
      // true transactions via callback might break if not awaited perfectly.
      // However, making the whole wrapper async at least catches errors.
      await fn();
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  };
}

module.exports = { getDb, initializeDatabase, saveDb, dbPrepare, dbExec, dbTransaction };
