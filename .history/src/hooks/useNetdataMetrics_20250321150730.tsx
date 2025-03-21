import { useState, useEffect, useCallback } from 'react';
import { NetdataInstance } from './useNetdataInstances';
import initSqlJs from 'sql.js';

export interface Metric {
  id: string;
  name: string;
  instanceId: string;
  selected: boolean;
}

interface MetricDetails {
  name: string;
  family: string;
  context: string;
  units: string;
  chartType: string;
  dimensions: {
    [dimensionName: string]: {
      name: string;
    }
  }
}

interface MetricResponse {
  charts: {
    [metricName: string]: MetricDetails;
  };
}

export function useNetdataMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const wasmBinary = await fetch(`${import.meta.env.BASE_URL}sqljs/sql-wasm.wasm`).then(res => res.arrayBuffer()); // 使用fetch获取wasm文件
        const SQL = await initSqlJs({
          locateFile: file => `${import.meta.env.BASE_URL}sqljs/${file}`, // 修改这里
          wasmBinary // 添加wasmBinary
        });
        const newDb = new SQL.Database();
        newDb.run(`
          CREATE TABLE IF NOT EXISTS selected_metrics (
            id TEXT PRIMARY KEY,
            instanceId TEXT
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
    const loadSelectedMetrics = async () => {
      if (!db) return;
      try {
        const result = db.exec('SELECT * FROM selected_metrics');
        if (result.length > 0) {
          const rows = result[0].values;
          const loadedSelectedMetrics = rows.map(row => row[0]);
          setSelectedMetricIds(loadedSelectedMetrics);
        }
      } catch (err) {
        setError('Failed to load selected metrics');
        console.error('Failed to load selected metrics:', err);
      }
    };
    loadSelectedMetrics();
  }, [db]);

  useEffect(() => {
    const saveSelectedMetrics = async () => {
      if (!db) return;
      try {
        db.run('DELETE FROM selected_metrics');
        selectedMetricIds.forEach(id => {
          db.run('INSERT INTO selected_metrics (id) VALUES (?)', [id]);
        });
      } catch (err) {
        setError('Failed to save selected metrics');
        console.error('Failed to save selected metrics:', err);
      }
    };
    saveSelectedMetrics();
  }, [selectedMetricIds, db]);

  const fetchMetricsList = async (instance: NetdataInstance) => {
    setIsLoading(true);
    setError(null);
    console.log("fetchMetricsList called for instance:", instance);
    try {
      const response = await fetch(`${instance.url}/api/v1/charts`);

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data = await response.json() as MetricResponse;

      // Correctly access the charts property
      const fetchedMetrics = Object.entries(data.charts).map(([metricName, metricDetails]) => ({
        id: crypto.randomUUID(),
        name: metricName,
        instanceId: instance.id,
        selected: false,
      }));

      // Merge with existing metrics, keeping selected state
      setMetrics(prev => {
        // Keep metrics from other instances
        const otherInstanceMetrics = prev.filter(m => m.instanceId !== instance.id);

        // Map through new metrics and preserve selected state if the metric already existed
        const updatedInstanceMetrics = fetchedMetrics.map(newMetric => {
          const existingMetric = prev.find(m =>
            m.instanceId === instance.id && m.name === newMetric.name
          );

          return existingMetric
            ? { ...newMetric, id: existingMetric.id, selected: existingMetric.selected }
            : newMetric;
        });
        console.log("metrics after fetchMetricsList:", [...otherInstanceMetrics, ...updatedInstanceMetrics]); // 添加这行代码
        return [...otherInstanceMetrics, ...updatedInstanceMetrics];
      });

      setIsLoading(false);
      return fetchedMetrics;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(errorMessage);
      setIsLoading(false);
      return [];
    }
  };

  const toggleMetricSelection = useCallback((metricId: string) => {
    setMetrics(prev => {
      const newMetrics = prev.map(metric => {
        if (metric.id === metricId) {
          return { ...metric, selected: !metric.selected };
        }
        return metric;
      });
      console.log("metrics after toggle:", newMetrics); // 添加这行代码
      return newMetrics;
    });
    setSelectedMetricIds(prev => {
      console.log("selectedMetricIds:", prev);
      if (prev.includes(metricId)) {
        return prev.filter(id => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  }, []);

  const selectMetrics = (metricIds: string[]) => {
    setSelectedMetricIds(metricIds);
    setMetrics(prev => {
      return prev.map(metric => {
        return { ...metric, selected: metricIds.includes(metric.id) };
      });
    });
  };

  const getInstanceMetrics = (instanceId: string) => {
    return metrics.filter(metric => metric.instanceId === instanceId);
  };

  const getSelectedMetrics = useCallback(() => {
    return metrics.filter(metric => selectedMetricIds.includes(metric.id));
  }, [metrics, selectedMetricIds]); // 添加依赖项

  const fetchSelectedMetrics = useCallback(() => {
    return metrics.filter(metric => selectedMetricIds.includes(metric.id));
  }, [metrics, selectedMetricIds]); // 添加依赖项

  const removeInstanceMetrics = (instanceId: string) => {
    setMetrics(prev => prev.filter(metric => metric.instanceId !== instanceId));
  };

  return {
    metrics,
    isLoading,
    error,
    fetchMetricsList,
    toggleMetricSelection,
    selectMetrics,
    getInstanceMetrics,
    getSelectedMetrics,
    removeInstanceMetrics,
    fetchSelectedMetrics
  };
}
