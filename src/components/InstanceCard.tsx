
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NetdataInstance } from "@/hooks/useNetdataInstances";
import { Trash2, RefreshCw, Check, X } from "lucide-react";
import { useState } from "react";

interface InstanceCardProps {
  instance: NetdataInstance;
  onDelete: (id: string) => void;
  onRefresh: (instance: NetdataInstance) => Promise<void>;
  isRefreshing?: boolean;
}

export function InstanceCard({ instance, onDelete, onRefresh, isRefreshing }: InstanceCardProps) {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  const handleTest = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(`${instance.url}/api/v1/info`);
      if (response.ok) {
        setTestResult({ success: true, message: "Connection successful" });
      } else {
        setTestResult({ success: false, message: "Connection failed" });
      }
    } catch (error) {
      setTestResult({ success: false, message: "Connection failed" });
    } finally {
      setIsTesting(false);
    }
    
    // Clear the test result after 3 seconds
    setTimeout(() => {
      setTestResult(null);
    }, 3000);
  };
  
  return (
    <Card className="card-hover overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{instance.name}</CardTitle>
        <CardDescription className="line-clamp-1 text-xs">{instance.url}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        {testResult && (
          <div className={`mb-2 text-sm p-2 rounded-md flex items-center ${
            testResult.success ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {testResult.success ? 
              <Check className="h-4 w-4 mr-2" /> : 
              <X className="h-4 w-4 mr-2" />
            }
            {testResult.message}
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Instance ID: {instance.id.substring(0, 8)}...</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={isTesting}
        >
          {isTesting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              Testing
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onRefresh(instance)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(instance.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
