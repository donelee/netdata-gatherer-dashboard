import { useState, useEffect } from 'react';
import initSqlJs from 'sql.js';

export interface NetdataInstance {
  id: string;
  name: string;
  url: string;
}

export function useNetdataInstances() {
  const [instances, setInstances] = useState<NetdataInstance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const wasmBinary = await fetch(`${import.meta.env.BASE_URL}sqljs/sql-wasm.wasm`).then(res => res.arrayBuffer()); // 使用fetch获取wasm文件
        const SQL = await initSqlJs({
          locateFile: () => `${import.meta.env.BASE_URL}sqljs/sql-wasm.wasm`,
          wasmBinary // 添加wasmBinary
        });

        const newDb = new SQL.Database();
        newDb.run(`
          CREATE TABLE IF NOT EXISTS instances (
            id TEXT PRIMARY KEY,
            name TEXT,
            url TEXT
          );
        `);
        setDb(newDb);
      } catch (err) {
        setError('Failed to initialize database');
        console.error('Failed to initialize database:', err);
      }
    };

    initializeDatabase();
  }, []);

  useEffect(() => {
    const loadInstances = async () => {
      if (!db) return;
      try {
        const result = db.exec('SELECT * FROM instances');
        if (result.length > 0) {
          const rows = result[0].values;
          const loadedInstances = rows.map(row => ({
            id: row[0],
            name: row[1],
            url: row[2],
          }));
          setInstances(loadedInstances);
        }
      } catch (err) {
        setError('Failed to load instances');
        console.error('Failed to load instances:', err);
      }
    };
    loadInstances();
  }, [db]);

  const addInstance = async (name: string, url: string) => {
    if (!db) return;
    const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const newInstance = {
      id: crypto.randomUUID(),
      name,
      url: formattedUrl
    };
    try {
      db.run('INSERT INTO instances (id, name, url) VALUES (?, ?, ?)', [newInstance.id, newInstance.name, newInstance.url]);
      setInstances(prev => [...prev, newInstance]);
    } catch (err) {
      setError('Failed to add instance');
      console.error('Failed to add instance:', err);
    }
    return newInstance;
  };

  const removeInstance = async (id: string) => {
    if (!db) return;
    try {
      db.run('DELETE FROM instances WHERE id = ?', [id]);
      setInstances(prev => prev.filter(instance => instance.id !== id));
    } catch (err) {
      setError('Failed to remove instance');
      console.error('Failed to remove instance:', err);
    }
  };

  const updateInstance = async (id: string, updatedInstance: Partial<NetdataInstance>) => {
    if (!db) return;
    try {
      const instanceToUpdate = instances.find(instance => instance.id === id);
      if (!instanceToUpdate) return;
      const newInstance = { ...instanceToUpdate, ...updatedInstance };
      db.run('UPDATE instances SET name = ?, url = ? WHERE id = ?', [newInstance.name, newInstance.url, newInstance.id]);
      setInstances(prev =>
        prev.map(instance =>
          instance.id === id ? newInstance : instance
        )
      );
    } catch (err) {
      setError('Failed to update instance');
      console.error('Failed to update instance:', err);
    }
  };

  const testConnection = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${url}/api/v1/info`);
      if (!response.ok) {
        throw new Error(`Failed to connect to Netdata instance: ${response.statusText}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Netdata instance';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    instances,
    isLoading,
    error,
    addInstance,
    removeInstance,
    updateInstance,
    testConnection
  };
}
