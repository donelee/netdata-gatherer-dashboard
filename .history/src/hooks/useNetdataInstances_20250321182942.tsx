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
  const [searchKeyword, setSearchKeyword] = useState<string>(''); // 添加搜索关键词状态

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

  // 添加过滤指标的函数
  const getFilteredMetrics = (instanceId: string) => {
    const instanceMetrics = getInstanceMetrics(instanceId);
    if (!searchKeyword) {
      return instanceMetrics;
    }
    return instanceMetrics.filter(metric =>
      metric.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
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
    getFilteredMetrics, // 导出过滤后的指标
    searchKeyword, // 导出搜索关键词
    setSearchKeyword // 导出设置搜索关键词的函数
  };
}
