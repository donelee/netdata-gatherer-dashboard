import initSqlJs from 'sql.js';

let db: any = null;
let dbError: string | null = null;

const initializeDatabase = async () => {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `${import.meta.env.BASE_URL}sqljs/${file}`,
    });
    const wasmBinary = await fetch(`${import.meta.env.BASE_URL}sqljs/sql-wasm.wasm`).then(res => res.arrayBuffer());
    db = new SQL.Database(new Uint8Array(wasmBinary));
  } catch (err) {
    dbError = 'Failed to initialize database';
    console.error('Failed to initialize database:', err);
  }
};

initializeDatabase();

export const getDb = () => {
  return { db, dbError };
};
