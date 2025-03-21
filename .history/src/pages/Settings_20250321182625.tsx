import { InstanceCard } from "@/components/InstanceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNetdataInstances } from "@/hooks/useNetdataInstances";
import { useNetdataMetrics } from "@/hooks/useNetdataMetrics"; // 修改这里
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom"; // 引入 useNavigate

export default function Settings() {
  const { instances, addInstance, removeInstance, updateInstance, testConnection, error: instancesDbError } = useNetdataInstances(); // 修改这里
  const { metrics, fetchMetricsList, toggleMetricSelection, selectMetrics, getFilteredMetrics, removeInstanceMetrics, error: metricsDbError, searchKeyword, setSearchKeyword } = useNetdataMetrics(); // 修改这里
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate(); // 初始化 useNavigate

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

  const handleSaveMetrics = () => {
    console.log("metrics before save:", metrics); // 添加这行代码
    const selectedMetrics = metrics.filter(metric => metric.selected).map(metric => metric.id);
    console.log("selectMetrics called with:", selectedMetrics);
    selectMetrics(selectedMetrics);
    console.log("metrics after save:", metrics); // 添加这行代码
    navigate("/"); // 跳转到 Dashboard 页面
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        {instancesDbError && <div className="text-red-500">{instancesDbError}</div>}
        {metricsDbError && <div className="text-red-500">{metricsDbError}</div>}

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
          <div className="flex justify-between items-center"> {/* 添加这行代码 */}
            <h2 className="text-xl font-semibold">Metrics</h2>
            <Button onClick={handleSaveMetrics}>Save Metrics</Button> {/* 添加这行代码 */}
          </div> {/* 添加这行代码 */}
          <Input
            type="text"
            placeholder="Search metrics..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)} // 添加搜索框
            className="mb-2"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {instances.map((instance) => {
              const instanceMetrics = getFilteredMetrics(instance.id); // 使用过滤后的指标
              console.log("instanceMetrics for instance", instance.name, ":", instanceMetrics); // 添加这行代码
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
