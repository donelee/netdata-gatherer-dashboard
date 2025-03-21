import initSqlJs from 'sql.js';

let db: any = null;
let dbError: string | null = null;
let SQL:any = null;

export const initializeDatabase = async () => {
  try {
    SQL = await initSqlJs({
      locateFile: file => `${import.meta.env.BASE_URL}sqljs/${file}`,
    });
    const wasmBinary = await fetch(`${import.meta.env.BASE_URL}sqljs/sql-wasm.wasm`).then(res => res.arrayBuffer());
    db = new SQL.Database(new Uint8Array(wasmBinary));
    db.run(`
          CREATE TABLE IF NOT EXISTS instances (
            id TEXT PRIMARY KEY,
            name TEXT,
            url TEXT
          );
        `);
    db.run(`
          CREATE TABLE IF NOT EXISTS selected_metrics (
            id TEXT PRIMARY KEY,
            instanceId TEXT
          );
        `);
  } catch (err) {
    dbError = 'Failed to initialize database';
    console.error('Failed to initialize database:', err);
  }
};

export const getDb = () => {
  return { db, dbError, SQL };
};
