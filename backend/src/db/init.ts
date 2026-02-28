import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = path.resolve(
  process.env.DATABASE_PATH ||
    path.join(__dirname, '..', '..', 'data', 'dragonsat.db')
);

export function initializeDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Read and execute schema
      const schema = fs.readFileSync(
        path.join(__dirname, 'schema.sql'),
        'utf-8'
      );

      db.exec(schema, async (execErr) => {
        if (execErr) {
          reject(execErr);
          return;
        }

        try {
          await runMigrations(db);
          console.log('Database initialized successfully');
          resolve(db);
        } catch (migErr) {
          reject(migErr);
        }
      });
    });
  });
}

async function runMigrations(db: sqlite3.Database): Promise<void> {
  const columns = await allAsync(db, 'PRAGMA table_info(users)');
  const colNames = columns.map((c: any) => c.name);
  if (!colNames.includes('username')) {
    await runAsync(db, 'ALTER TABLE users ADD COLUMN username TEXT');
  }
  if (!colNames.includes('password_hash')) {
    await runAsync(db, 'ALTER TABLE users ADD COLUMN password_hash TEXT');
  }
  if (!colNames.includes('email')) {
    await runAsync(db, 'ALTER TABLE users ADD COLUMN email TEXT');
  }
  if (!colNames.includes('google_id')) {
    await runAsync(db, 'ALTER TABLE users ADD COLUMN google_id TEXT');
  }
  await runAsync(
    db,
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username) WHERE username IS NOT NULL'
  );
  await runAsync(
    db,
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id) WHERE google_id IS NOT NULL'
  );

  const responseCols = await allAsync(db, 'PRAGMA table_info(responses)');
  const respColNames = responseCols.map((c: any) => c.name);
  if (!respColNames.includes('section')) {
    await runAsync(db, 'ALTER TABLE responses ADD COLUMN section TEXT');
  }
  if (!respColNames.includes('domain')) {
    await runAsync(db, 'ALTER TABLE responses ADD COLUMN domain TEXT');
  }
  await runAsync(
    db,
    'CREATE INDEX IF NOT EXISTS idx_responses_domain ON responses(domain)'
  );
}

export function runAsync(
  db: sqlite3.Database,
  sql: string,
  params: any[] = []
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function getAsync(
  db: sqlite3.Database,
  sql: string,
  params: any[] = []
): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allAsync(
  db: sqlite3.Database,
  sql: string,
  params: any[] = []
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}
