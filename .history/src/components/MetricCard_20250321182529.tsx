import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
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

interface ChartDetails {
  units: string;
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
  const lastDataPointTime = useRef<number | null>(null); // 用于记录最后一个数据点的时间

  const fetchMetricData = async () => {
    try {
      setIsLoading(true);
      // 获取当前时间
      const now = Math.floor(Date.now() / 1000);
      // 获取5分钟前的时间
      const fiveMinutesAgo = now - 300;
      // 设置数据点数量
      const points = 30; // 修改数据点为30
      // 设置请求的开始时间
      let after = fiveMinutesAgo;
      // 如果已经有数据，则使用最后一个数据点的时间作为开始时间
      if (lastDataPointTime.current !== null) {
        after = lastDataPointTime.current;
      }

      // 构建请求 URL
      const url = `${instanceUrl}/api/v1/data?chart=${metricName}&format=json&after=${after}&before=${now}&points=${points}`;
      console.log("fetchMetricData url:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const jsonData = await response.json();
      console.log("jsonData:", jsonData);

      if (jsonData && jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
        // Netdata 返回的数据格式：
        // - 第一个元素是时间戳
        // - 其他元素是每个维度的值
        // 我们目前取第二个维度
        const formattedData = jsonData.data.map((point: number[]) => ({
          time: point[0] * 1000, // 转换为毫秒，以便 recharts 使用
          value: point.length > 2 ? point[2] : null // 使用 point[2] (used)
        }));

        // 更新最后一个数据点的时间
        lastDataPointTime.current = jsonData.data[jsonData.data.length - 1][0];

        // 增量更新数据
        setData(prevData => {
          // 如果是第一次获取数据，则直接返回新数据
          if (prevData.length === 0) {
            return formattedData;
          }
          // 否则，将新数据添加到旧数据后面
          return [...prevData, ...formattedData];
        });

        setLastUpdated(new Date());
        setError(null);
      } else {
        setIsLoading(false);
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

  const fetchChartDetails = async () => {
    try {
      const response = await fetch(`${instanceUrl}/api/v1/charts`);
      if (!response.ok) {
        throw new Error(`Failed to fetch chart details: ${response.statusText}`);
      }
      const data = await response.json();
      const chartDetails = data.charts[metricName] as ChartDetails;
      if (chartDetails && chartDetails.units) {
        setUnits(chartDetails.units);
      }
    } catch (err) {
      console.error('Error fetching chart details:', err);
    }
  };

  useEffect(() => {
    fetchMetricData();
    fetchChartDetails();

    // 设置轮询间隔
    const intervalId = setInterval(fetchMetricData, refreshInterval);

    return () => clearInterval(intervalId);
  }, [metricName, instanceUrl, refreshInterval]);

  // 格式化时间，用于 tooltip
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // 根据数据找到合理的图表最小值/最大值
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
