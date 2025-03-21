import { useState, useEffect } from 'react';

export interface NetdataInstance {
  id: string;
  name: string;
  url: string;
}

export function useNetdataInstances() {
  const [instances, setInstances] = useState<NetdataInstance[]>(() => {
    const savedInstances = localStorage.getItem('netdata-instances');
    return savedInstances ? JSON.parse(savedInstances) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('netdata-instances', JSON.stringify(instances));
  }, [instances]);

  const addInstance = (name: string, url: string) => {
    // Remove trailing slash if present
    const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const newInstance = {
      id: crypto.randomUUID(),
      name,
      url: formattedUrl
    };
    setInstances(prev => [
      ...prev,
      newInstance
    ]);
    return newInstance; // 添加这行代码
  };

  const removeInstance = (id: string) => {
    setInstances(prev => prev.filter(instance => instance.id !== id));
  };

  const updateInstance = (id: string, updatedInstance: Partial<NetdataInstance>) => {
    setInstances(prev => 
      prev.map(instance => 
        instance.id === id ? { ...instance, ...updatedInstance } : instance
      )
    );
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
