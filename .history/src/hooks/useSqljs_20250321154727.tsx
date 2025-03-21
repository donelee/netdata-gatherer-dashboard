import initSqlJs from 'sql.js';
import { useState, useEffect } from 'react';

export const useSqlJs = () => {
  const [db, setDb] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: file => `${import.meta.env.BASE_URL}sqljs/${file}`,
        });
        const wasmBinary = await fetch(`${import.meta.env.BASE_URL}sqljs/sql-wasm.wasm`).then(res => res.arrayBuffer());
        const newDb = new SQL.Database(new Uint8Array(wasmBinary));
        setDb(newDb);
      } catch (err) {
        setError('Failed to initialize database');
        console.error('Failed to initialize database:', err);
      }
    };

    initializeDatabase();
  }, []);

  return { db, error };
};
