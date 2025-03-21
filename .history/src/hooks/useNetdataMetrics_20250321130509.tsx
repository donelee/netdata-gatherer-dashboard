import { useState, useEffect } from 'react';
import { NetdataInstance } from './useNetdataInstances';

export interface Metric {
  id: string;
  name: string;
  instanceId: string;
  selected: boolean;
}

interface MetricResponse {
  [metricName: string]: {
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
}

export function useNetdataMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>(() => {
    const savedMetrics = localStorage.getItem('netdata-metrics');
    return savedMetrics ? JSON.parse(savedMetrics) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('netdata-metrics', JSON.stringify(metrics));
  }, [metrics]);

  const fetchMetricsList = async (instance: NetdataInstance) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${instance.url}/api/v1/charts`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }
      
      const data = await response.json() as MetricResponse;
      
      // Convert the metrics response to our Metric structure
      const fetchedMetrics = Object.entries(data).map(([metricName, metricDetails]) => ({
        id: crypto.randomUUID(),
        name: metricName,
        instanceId: instance.id,
        selected: false,
        // You can store more details if needed
        details: metricDetails
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

  const toggleMetricSelection = (metricId: string) => {
    setMetrics(prev => 
      prev.map(metric => 
        metric.id === metricId ? { ...metric, selected: !metric.selected } : metric
      )
    );
  };

  const selectMetrics = (metricIds: string[]) => {
    setMetrics(prev => 
      prev.map(metric => ({
        ...metric,
        selected: metricIds.includes(metric.id)
      }))
    );
  };

  const getInstanceMetrics = (instanceId: string) => {
    return metrics.filter(metric => metric.instanceId === instanceId);
  };

  const getSelectedMetrics = () => {
    return metrics.filter(metric => metric.selected);
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
    removeInstanceMetrics
  };
}
