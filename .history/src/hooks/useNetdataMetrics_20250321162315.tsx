import { useState } from 'react';
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

let metrics: Metric[] = [];
let selectedMetricIds: string[] = [];

export function useNetdataMetrics() {
  const [_, forceUpdate] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      metrics = metrics.filter(m => m.instanceId !== instance.id);
      metrics.push(...fetchedMetrics);
      forceUpdate({});

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
    metrics = metrics.map(metric => {
      if (metric.id === metricId) {
        return { ...metric, selected: !metric.selected };
      }
      return metric;
    });
    if (selectedMetricIds.includes(metricId)) {
      selectedMetricIds = selectedMetricIds.filter(id => id !== metricId);
    } else {
      selectedMetricIds.push(metricId);
    }
    forceUpdate({});
  };

  const selectMetrics = (metricIds: string[]) => {
    selectedMetricIds = metricIds;
    metrics = metrics.map(metric => {
      return { ...metric, selected: metricIds.includes(metric.id) };
    });
    forceUpdate({});
  };

  const getInstanceMetrics = (instanceId: string) => {
    return metrics.filter(metric => metric.instanceId === instanceId);
  };

  const getSelectedMetrics = () => {
    return metrics.filter(metric => selectedMetricIds.includes(metric.id));
  };

  const fetchSelectedMetrics = () => {
    return metrics.filter(metric => selectedMetricIds.includes(metric.id));
  };

  const removeInstanceMetrics = (instanceId: string) => {
    metrics = metrics.filter(metric => metric.instanceId !== instanceId);
    forceUpdate({});
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
    fetchSelectedMetrics,
  };
}
