
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { useNetdataInstances } from "@/hooks/useNetdataInstances";
import { useNetdataMetrics } from "@/hooks/useNetdataMetrics";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { instances } = useNetdataInstances();
  const { getSelectedMetrics } = useNetdataMetrics();
  const [selectedMetrics, setSelectedMetrics] = useState<ReturnType<typeof getSelectedMetrics>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds
  
  useEffect(() => {
    setIsLoading(true);
    
    // Small delay to allow animation
    const timer = setTimeout(() => {
      setSelectedMetrics(getSelectedMetrics());
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [getSelectedMetrics]);
  
  const getInstanceById = (id: string) => {
    return instances.find(instance => instance.id === id);
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    setSelectedMetrics([]);
    
    // Small delay for animation
    setTimeout(() => {
      setSelectedMetrics(getSelectedMetrics());
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <Layout>
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight transition-colors">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor your Netdata instances in real-time.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
        
        {instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-medium">No Netdata Instances</h2>
              <p className="text-muted-foreground">
                You need to configure Netdata instances before you can see metrics.
              </p>
              <Button asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Instances
                </Link>
              </Button>
            </div>
          </div>
        ) : selectedMetrics.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-medium">No Metrics Selected</h2>
              <p className="text-muted-foreground">
                You need to select metrics to display on your dashboard.
              </p>
              <Button asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Select Metrics
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="dashboard-grid pb-8">
            {isLoading ? (
              // Show skeleton cards while loading
              Array.from({ length: 8 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))
            ) : (
              // Show actual metric cards
              selectedMetrics.map((metric) => {
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
              })
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
