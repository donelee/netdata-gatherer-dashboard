import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { RefreshCw } from "lucide-react";

interface MetricCardProps {
  metricName: string;
  instanceName: string;
  instanceUrl: string;
  refreshInterval?: number; // in milliseconds
}

interface MetricDataPoint {
  time: number;
  value: number | null;
}

export function MetricCard({
  metricName,
  instanceName,
  instanceUrl,
  refreshInterval = 30000 // Default refresh every 30 seconds
}: MetricCardProps) {
  const [data, setData] = useState<MetricDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [units, setUnits] = useState<string>('');

  const fetchMetricData = async () => {
    try {
      setIsLoading(true);
      // Fetch the last 5 minutes of data with a step of 15 seconds
      const now = Math.floor(Date.now() / 1000);
      const fiveMinutesAgo = now - 300;

      // Corrected URL: Use the metricName prop
      const response = await fetch(
        `${instanceUrl}/api/v1/data?chart=${metricName}&format=json&after=${fiveMinutesAgo}&before=${now}&points=10` // 修改数据点为10
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const jsonData = await response.json();
      console.log("jsonData:", jsonData); // 添加这行代码

      if (jsonData && jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) { // 添加数据长度判断
        // Netdata returns an array where:
        // - First element is timestamp
        // - Other elements are values for each dimension
        // We'll take the second dimension for now
        const formattedData = jsonData.data.map((point: number[]) => ({
          time: point[0] * 1000, // Convert to milliseconds for recharts
          value: point.length > 2 ? point[2] : null // Use point[2] (used)
        }));

        // Get units from API response
        if (jsonData.units) { // 添加units判断
          setUnits(jsonData.units);
        }

        // Compare new and old data before updating
        if (JSON.stringify(data) !== JSON.stringify(formattedData)) { // 添加数据比较
          setData(formattedData);
        }

        setLastUpdated(new Date());
        setError(null);
      } else {
        setIsLoading(false); // 添加isLoading设置
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metric data';
      setError(errorMessage);
      console.error('Error fetching metric data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricData();

    // Set up polling interval
    const intervalId = setInterval(fetchMetricData, refreshInterval);

    return () => clearInterval(intervalId);
  }, [metricName, instanceUrl, refreshInterval]);

  // Format the time for the tooltip
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Find a reasonable min/max for the chart based on the data
  const dataMin = Math.min(...data.map(d => d.value !== null ? d.value : Infinity));
  const dataMax = Math.max(...data.map(d => d.value !== null ? d.value : -Infinity));
  const yDomain = [
    dataMin !== Infinity ? Math.floor(dataMin * 0.9) : 0,
    dataMax !== -Infinity ? Math.ceil(dataMax * 1.1) : 100
  ];

  return (
    <Card className="card-hover h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-medium line-clamp-1">{metricName}</CardTitle>
            <CardDescription className="text-xs">{instanceName}</CardDescription>
          </div>
          <div className="flex items-center">
            {isLoading && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 p-4 text-sm text-center">
            {error}
          </div>
        ) : (
          <>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <XAxis
                    dataKey="time"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={formatTime}
                    type="number"
                    hide
                  />
                  <YAxis
                    domain={yDomain}
                    width={30}
                    tickCount={5}
                    tickFormatter={(value) => `${value}`}
                    fontSize={10}
                  />
                  <Tooltip
                    labelFormatter={(label) => formatTime(label)}
                    formatter={(value) => [`${value} ${units}`, '']}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.75rem'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false} // 添加这行代码
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 text-xs text-muted-foreground flex justify-between">
              <span>
                Units: {units || 'N/A'}
              </span>
              {lastUpdated && (
                <span>
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
