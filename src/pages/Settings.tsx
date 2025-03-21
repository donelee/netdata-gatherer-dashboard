
import { useState } from "react";
import { NetdataInstance, useNetdataInstances } from "@/hooks/useNetdataInstances";
import { useNetdataMetrics } from "@/hooks/useNetdataMetrics";
import { Layout } from "@/components/Layout";
import { InstanceCard } from "@/components/InstanceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PlusCircle, Save, RefreshCw } from "lucide-react";

export default function Settings() {
  const { 
    instances, 
    addInstance, 
    removeInstance, 
    testConnection 
  } = useNetdataInstances();
  
  const { 
    metrics, 
    fetchMetricsList, 
    toggleMetricSelection,
    getInstanceMetrics,
    removeInstanceMetrics
  } = useNetdataMetrics();
  
  const [newInstanceName, setNewInstanceName] = useState("");
  const [newInstanceUrl, setNewInstanceUrl] = useState("");
  const [refreshingInstance, setRefreshingInstance] = useState<string | null>(null);
  
  const handleAddInstance = async () => {
    if (!newInstanceName.trim() || !newInstanceUrl.trim()) {
      toast.error("Please provide both a name and URL.");
      return;
    }
    
    try {
      // Test connection first
      const result = await testConnection(newInstanceUrl);
      
      if (result.success) {
        addInstance(newInstanceName, newInstanceUrl);
        setNewInstanceName("");
        setNewInstanceUrl("");
        toast.success(`Added instance: ${newInstanceName}`);
      } else {
        toast.error(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to add instance. Please check the URL and try again.");
    }
  };
  
  const handleDeleteInstance = (id: string) => {
    // Remove the instance
    removeInstance(id);
    
    // Also remove all metrics associated with this instance
    removeInstanceMetrics(id);
    
    toast.success("Instance removed successfully");
  };
  
  const handleRefreshMetrics = async (instance: NetdataInstance) => {
    setRefreshingInstance(instance.id);
    
    try {
      await fetchMetricsList(instance);
      toast.success(`Refreshed metrics for ${instance.name}`);
    } catch (error) {
      toast.error(`Failed to refresh metrics for ${instance.name}`);
    } finally {
      setRefreshingInstance(null);
    }
  };
  
  const handleMetricsSelectionSave = () => {
    // This doesn't need to do anything special since we're already saving to localStorage
    // on every change, but we'll show a toast for user feedback
    toast.success("Metric selections saved successfully");
  };
  
  return (
    <Layout>
      <div className="flex flex-col space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight transition-colors">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your Netdata instances and select metrics to display on the dashboard.
          </p>
        </div>
        
        <Tabs defaultValue="instances" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="instances">Instances</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="instances" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Add Netdata Instance</CardTitle>
                <CardDescription>
                  Enter the details of your Netdata instance to monitor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instance-name">Instance Name</Label>
                  <Input
                    id="instance-name"
                    placeholder="My Server"
                    value={newInstanceName}
                    onChange={(e) => setNewInstanceName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instance-url">
                    Instance URL
                    <span className="text-xs text-muted-foreground ml-2">
                      (e.g., http://192.168.1.10:19999)
                    </span>
                  </Label>
                  <Input
                    id="instance-url"
                    placeholder="http://192.168.1.10:19999"
                    value={newInstanceUrl}
                    onChange={(e) => setNewInstanceUrl(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddInstance}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Instance
                </Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configured Instances</h3>
              
              {instances.length === 0 ? (
                <div className="text-center p-6 border rounded-lg bg-card">
                  <p className="text-muted-foreground">No instances configured yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first Netdata instance above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {instances.map((instance) => (
                    <InstanceCard
                      key={instance.id}
                      instance={instance}
                      onDelete={handleDeleteInstance}
                      onRefresh={handleRefreshMetrics}
                      isRefreshing={refreshingInstance === instance.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-6 animate-fade-in">
            {instances.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-card">
                <p className="text-muted-foreground">No instances configured yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add Netdata instances in the Instances tab first.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Select Metrics to Monitor</h3>
                  <Button onClick={handleMetricsSelectionSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Selections
                  </Button>
                </div>
                
                {instances.map((instance) => {
                  const instanceMetrics = getInstanceMetrics(instance.id);
                  
                  return (
                    <Card key={instance.id} className="overflow-hidden">
                      <CardHeader className="bg-secondary/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">{instance.name}</CardTitle>
                            <CardDescription className="text-xs">{instance.url}</CardDescription>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRefreshMetrics(instance)}
                            disabled={refreshingInstance === instance.id}
                          >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshingInstance === instance.id ? 'animate-spin' : ''}`} />
                            Refresh Metrics
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {instanceMetrics.length === 0 ? (
                          <div className="text-center p-6">
                            <p className="text-muted-foreground">No metrics available.</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Click 'Refresh Metrics' to fetch available metrics.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                              {instanceMetrics.filter(m => m.selected).length} of {instanceMetrics.length} metrics selected
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-2 max-h-96 overflow-y-auto p-2">
                              {instanceMetrics.map((metric) => (
                                <div key={metric.id} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={metric.id} 
                                    checked={metric.selected}
                                    onCheckedChange={() => toggleMetricSelection(metric.id)}
                                  />
                                  <Label 
                                    htmlFor={metric.id} 
                                    className="text-sm cursor-pointer line-clamp-1"
                                  >
                                    {metric.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
