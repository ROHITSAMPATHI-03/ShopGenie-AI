import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { env } from '../config/env.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ISqliteStatement {
  run(...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  get(...params: any[]): any;
  all(...params: any[]): any[];
}

export interface ISqliteDatabase {
  prepare(sql: string): ISqliteStatement;
  exec(sql: string): void;
  pragma(pragmaStr: string): void;
  transaction<T extends (...args: any[]) => any>(fn: T): T;
  close(): void;
}

let dbInstance: ISqliteDatabase | null = null;

function resolveDatabasePath(): string {
  if (path.isAbsolute(env.DATABASE_PATH)) {
    return env.DATABASE_PATH;
  }
  const cwd = process.cwd();
  if (fs.existsSync(path.resolve(cwd, 'backend'))) {
    return path.resolve(cwd, env.DATABASE_PATH);
  }
  return path.resolve(cwd, '..', env.DATABASE_PATH);
}

class NodeSqliteAdapter implements ISqliteDatabase {
  private rawDb: any;

  constructor(dbPath: string) {
    const { DatabaseSync } = require('node:sqlite');
    this.rawDb = new DatabaseSync(dbPath);
  }

  pragma(pragmaStr: string): void {
    try {
      this.rawDb.exec(`PRAGMA ${pragmaStr};`);
    } catch (e) {
      // WAL or other pragmas might not be critical on sync in-memory
    }
  }

  exec(sql: string): void {
    this.rawDb.exec(sql);
  }

  prepare(sql: string): ISqliteStatement {
    const rawStmt = this.rawDb.prepare(sql);
    try {
      if (typeof rawStmt.setAllowBareNamedParameters === 'function') {
        rawStmt.setAllowBareNamedParameters(true);
      }
      if (typeof rawStmt.setAllowUnknownNamedParameters === 'function') {
        rawStmt.setAllowUnknownNamedParameters(true);
      }
    } catch {}

    return {
      run: (...params: any[]) => {
        // If single argument is an object (named parameters)
        if (params.length === 1 && params[0] && typeof params[0] === 'object' && !Array.isArray(params[0])) {
          return rawStmt.run(params[0]);
        }
        return rawStmt.run(...params);
      },
      get: (...params: any[]) => {
        if (params.length === 1 && params[0] && typeof params[0] === 'object' && !Array.isArray(params[0])) {
          return rawStmt.get(params[0]);
        }
        return rawStmt.get(...params);
      },
      all: (...params: any[]) => {
        if (params.length === 1 && params[0] && typeof params[0] === 'object' && !Array.isArray(params[0])) {
          return rawStmt.all(params[0]);
        }
        return rawStmt.all(...params);
      },
    };
  }

  transaction<T extends (...args: any[]) => any>(fn: T): T {
    const self = this;
    const wrapped = function (...args: any[]) {
      self.rawDb.exec('BEGIN');
      try {
        const result = fn(...args);
        self.rawDb.exec('COMMIT');
        return result;
      } catch (err) {
        self.rawDb.exec('ROLLBACK');
        throw err;
      }
    };
    return wrapped as unknown as T;
  }

  close(): void {
    this.rawDb.close();
  }
}

export function getDatabase(): ISqliteDatabase {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = resolveDatabasePath();
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  let db: ISqliteDatabase;

  // Try built-in node:sqlite first (native to Node.js v22.5.0+, v24, v26 - 100% ABI-safe)
  try {
    db = new NodeSqliteAdapter(dbPath);
    console.log('[Database] Connected via built-in node:sqlite engine.');
  } catch (nodeSqliteErr: any) {
    // Fall back to better-sqlite3 for Node v20 LTS
    try {
      const BetterSqlite = require('better-sqlite3');
      const rawBetter = new BetterSqlite(dbPath);
      rawBetter.pragma('journal_mode = WAL');
      rawBetter.pragma('foreign_keys = ON');
      db = rawBetter;
      console.log('[Database] Connected via better-sqlite3 engine.');
    } catch (betterSqliteErr: any) {
      throw new Error(
        `Failed to initialize SQLite driver. Neither node:sqlite nor better-sqlite3 could be loaded: ${betterSqliteErr.message}`
      );
    }
  }

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  // Safe column migration for existing tables before executing schema
  try {
    const tableInfo = db.prepare("PRAGMA table_info(conversations)").all() as any[];
    if (tableInfo && tableInfo.length > 0 && !tableInfo.some(col => col.name === 'conversation_id')) {
      db.exec('ALTER TABLE conversations ADD COLUMN conversation_id TEXT;');
    }
  } catch {}

  try {
    const webhookTableInfo = db.prepare("PRAGMA table_info(webhook_events)").all() as any[];
    if (webhookTableInfo && webhookTableInfo.length > 0) {
      if (!webhookTableInfo.some(col => col.name === 'status')) {
        db.exec("ALTER TABLE webhook_events ADD COLUMN status TEXT NOT NULL DEFAULT 'completed';");
      }
      if (!webhookTableInfo.some(col => col.name === 'error_message')) {
        db.exec("ALTER TABLE webhook_events ADD COLUMN error_message TEXT;");
      }
      if (!webhookTableInfo.some(col => col.name === 'processed_at')) {
        db.exec("ALTER TABLE webhook_events ADD COLUMN processed_at DATETIME;");
      }
    }
  } catch {}

  // Safe migration for orders table CHECK constraint to include refunded & reversed
  try {
    const orderSqlRow = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders'").get() as { sql: string } | undefined;
    if (orderSqlRow?.sql && !orderSqlRow.sql.includes('refunded')) {
      db.exec(`
        PRAGMA foreign_keys = OFF;
        CREATE TABLE IF NOT EXISTS orders_v2 (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'reversed')),
          subtotal_inr_paise INTEGER NOT NULL CHECK(subtotal_inr_paise >= 0),
          shipping_inr_paise INTEGER NOT NULL DEFAULT 0,
          tax_inr_paise INTEGER NOT NULL DEFAULT 0,
          total_inr_paise INTEGER NOT NULL CHECK(total_inr_paise >= 0),
          charge_currency TEXT NOT NULL DEFAULT 'USD',
          charge_amount_usd_cents INTEGER NOT NULL CHECK(charge_amount_usd_cents >= 0),
          inr_to_usd_rate REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES sessions(id)
        );
        INSERT INTO orders_v2 SELECT * FROM orders;
        DROP TABLE orders;
        ALTER TABLE orders_v2 RENAME TO orders;
        CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        PRAGMA foreign_keys = ON;
      `);
    }
  } catch (err) {
    console.warn('[Migration Warning] orders table migration:', err);
  }

  // Initialize schema
  let schemaPath = path.resolve(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    schemaPath = path.resolve(__dirname, '../../src/database/schema.sql');
  }
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  dbInstance = db;
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
