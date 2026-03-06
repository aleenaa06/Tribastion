require('dotenv').config();
const { createClient } = require('@libsql/client');

async function main() {
    const c = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    const result = await c.execute("SELECT username, password_hash FROM users");
    console.log("Users in Turso:", JSON.stringify(result.rows, null, 2));
}

main().catch(e => console.error("Error:", e));
