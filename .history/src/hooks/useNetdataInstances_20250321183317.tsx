import { useState } from 'react';

export interface NetdataInstance {
  id: string;
  name: string;
  url: string;
}

let instances: NetdataInstance[] = [];

export function useNetdataInstances() {
  const [_, forceUpdate] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addInstance = (name: string, url: string) => {
    const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const newInstance = {
      id: crypto.randomUUID(),
      name,
      url: formattedUrl
    };
    instances.push(newInstance);
    forceUpdate({});
    return newInstance;
  };

  const removeInstance = (id: string) => {
    instances = instances.filter(instance => instance.id !== id);
    forceUpdate({});
  };

  const updateInstance = (id: string, updatedInstance: Partial<NetdataInstance>) => {
    const instanceToUpdate = instances.find(instance => instance.id === id);
    if (!instanceToUpdate) return;
    const newInstance = { ...instanceToUpdate, ...updatedInstance };
    instances = instances.map(instance =>
      instance.id === id ? newInstance : instance
    );
    forceUpdate({});
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
    testConnection,
  };
}
