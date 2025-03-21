import { MetricCard } from "@/components/MetricCard";
import { useNetdataInstances } from "@/hooks/useNetdataInstances";
import { useNetdataMetrics } from "@/hooks/useNetdataMetrics";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { instances } = useNetdataInstances();
  const { fetchSelectedMetrics, metrics } = useNetdataMetrics();
  const [refreshInterval, setRefreshInterval] = useState(10000);
  const [selectedMetrics, setSelectedMetrics] = useState([]);

  useEffect(() => {
    setSelectedMetrics(fetchSelectedMetrics());
  }, [metrics]);

  console.log("metrics:", metrics); // 添加这行代码
  console.log("selectedMetrics:", selectedMetrics); // 添加这行代码

  const handleRefresh = () => {
    // Implement refresh logic here
  };

  const getInstanceById = (id: string) => {
    return instances.find((instance) => instance.id === id);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings">Settings</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {selectedMetrics.map((metric) => {
          const instance = getInstanceById(metric.instanceId);

          if (!instance) return null;

          return (
            <MetricCard
              key={metric.id}
              metricName={metric.name}
              instanceName={instance.name}
              instanceUrl={instance.url}
              refreshInterval={refreshInterval}
            />
          );
        })}
      </div>
    </Layout>
  );
}
