import { useState, useEffect, useCallback } from 'react';
import { NetdataInstance } from './useNetdataInstances';

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
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(() => {
    const savedSelectedMetrics = localStorage.getItem('netdata-selected-metrics');
    return savedSelectedMetrics ? JSON.parse(savedSelectedMetrics) : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Asynchronously update localStorage
    const timeoutId = setTimeout(() => {
      localStorage.setItem('netdata-selected-metrics', JSON.stringify(selectedMetricIds));
    }, 0); // Use a timeout of 0 to make it asynchronous

    return () => clearTimeout(timeoutId); // Cleanup on unmount
  }, [selectedMetricIds]);

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
        console.log("metrics after fetchMetricsList:", [...otherInstanceMetrics, ...updatedInstanceMetrics]);
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
      return prev.map(metric => {
        if (metric.id === metricId) {
          return { ...metric, selected: !metric.selected };
        }
        return metric;
      });
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

  const getSelectedMetrics = () => {
    return metrics.filter(metric => selectedMetricIds.includes(metric.id));
  };

  const fetchSelectedMetrics = () => {
    // setMetrics(prev => { // 移除这行代码
    //   return prev.map(metric => {
    //     return { ...metric, selected: selectedMetricIds.includes(metric.id) };
    //   });
    // });
    return metrics.filter(metric => selectedMetricIds.includes(metric.id));
  };

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
