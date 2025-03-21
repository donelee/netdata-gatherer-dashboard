
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-2">
          <div className="h-4 w-2/3 bg-secondary rounded animate-pulse-subtle"></div>
          <div className="h-3 w-1/2 bg-secondary rounded animate-pulse-subtle"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32 bg-secondary rounded animate-pulse-subtle"></div>
        <div className="mt-2 flex justify-between">
          <div className="h-3 w-1/4 bg-secondary rounded animate-pulse-subtle"></div>
          <div className="h-3 w-1/4 bg-secondary rounded animate-pulse-subtle"></div>
        </div>
      </CardContent>
    </Card>
  );
}
