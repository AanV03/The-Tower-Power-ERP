import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="w-full space-y-2 p-4">
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex gap-4">
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <Skeleton key={colIdx} className="flex-1 h-10 rounded-md" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <div className="w-full p-4 glass-effect rounded-lg">
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="w-full" style={{ height: `${height}px` }} />
            </div>
        </div>
    );
}

export function CardGridSkeleton({ count = 4, columns = 4 }: { count?: number; columns?: number }) {
    return (
        <div className={cn(
            "grid gap-4",
            `grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${columns}`
        )}>
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="glass-effect rounded-lg p-4 space-y-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-full" />
                </div>
            ))}
        </div>
    );
}

export function MetricCardSkeleton() {
    return (
        <div className="glass-effect rounded-lg p-4 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
            <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-4 w-8 rounded-full" />
                <Skeleton className="h-4 w-16" />
            </div>
        </div>
    );
}

export function AuditFeedSkeleton({ items = 5 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, idx) => (
                <div key={idx} className="flex gap-3 p-3 glass-effect rounded-lg">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
}

export function ListSkeleton({ items = 6 }: { items?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: items }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2">
                    <Skeleton className="w-10 h-10 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            ))}
        </div>
    );
}
