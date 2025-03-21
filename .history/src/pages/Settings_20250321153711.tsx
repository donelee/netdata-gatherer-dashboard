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

export default function Settings() {
  const { instances, addInstance, removeInstance, updateInstance, testConnection, dbError: instancesDbError } = useNetdataInstances(); // 修改这里
  const { metrics, fetchMetricsList, toggleMetricSelection, selectMetrics, getInstanceMetrics, removeInstanceMetrics, dbError: metricsDbError } = useNetdataMetrics(); // 修改这里
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

  const handleSaveMetrics = () => {
    console.log("metrics before save:", metrics); // 添加这行代码
    const selectedMetrics = metrics.filter(metric => metric.selected).map(metric => metric.id);
    console.log("selectMetrics called with:", selectedMetrics);
    selectMetrics(selectedMetrics);
    console.log("metrics after save:", metrics); // 添加这行代码
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
              placeholder="
