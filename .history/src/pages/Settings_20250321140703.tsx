import { InstanceCard } from "@/components/InstanceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNetdataInstances } from "@/hooks/useNetdataInstances";
import { useNetdataMetrics } from "@/hooks/useNetdataMetrics";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Settings() {
  const { instances, addInstance, removeInstance, updateInstance, testConnection } = useNetdataInstances();
  const { metrics, fetchMetricsList, toggleMetricSelection, selectMetrics, getInstanceMetrics, removeInstanceMetrics } = useNetdataMetrics();
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  const handleAddInstance = async () => {
    if (newName && newUrl) {
      const result = await testConnection(newUrl);
      if (result.success) {
        const newInstance = addInstance(newName, newUrl); // 修改这里，获取新添加的实例
        await fetchMetricsList(newInstance); // 添加这行代码，自动获取指标列表
        setNewUrl("");
        setNewName("");
      } else {
        alert(`Failed to connect to ${newUrl}: ${result.error}`);
      }
    }
  };

  const handleRefreshInstance = async (instance) => {
    setIsRefreshing(true);
    await fetchMetricsList(instance);
    setIsRefreshing(false);
  };

  const handleDeleteInstance = (id: string) => {
    removeInstance(id);
    removeInstanceMetrics(id);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Settings</h1>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Add Netdata Instance</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Instance Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Instance URL (e.g., http://localhost:19999)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <Button onClick={handleAddInstance}>Add Instance</Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Netdata Instances</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {instances.map((instance) => (
              <InstanceCard
                key={instance.id}
                instance={instance}
                onDelete={handleDeleteInstance}
                onRefresh={handleRefreshInstance}
                isRefreshing={isRefreshing}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {instances.map((instance) => {
              const instanceMetrics = getInstanceMetrics(instance.id);
              return instanceMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={metric.selected}
                    onCheckedChange={() => toggleMetricSelection(metric.id)}
                  />
                  <Label htmlFor={metric.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {metric.name} ({instance.name})
                  </Label>
                </div>
              ));
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
