const { getDb, dbPrepare } = require('./src/db/schema');

async function check() {
    await getDb();
    const rows = await dbPrepare('SELECT id, original_name, status, sanitization_method, pii_count FROM files ORDER BY created_at DESC LIMIT 20').all();
    const fs = require('fs');
    fs.writeFileSync('db_out.json', JSON.stringify(rows, null, 2));
}

check().catch(console.error);
