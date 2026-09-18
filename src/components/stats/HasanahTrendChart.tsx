'use client';

import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { TranslationTree } from "@/context/LocaleContext";
import { AppIcon } from "@/components/ui/AppIcon";

type TimeRange = 'today' | '7d' | '30d' | '90d' | '1y';
type HasanahPoint = { dateLabel: string; hasanah: number };

interface HasanahTrendChartProps {
    t: TranslationTree;
    chartData: HasanahPoint[];
    chartConfig: ChartConfig;
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
}

export function HasanahTrendChart({
    t,
    chartData,
    chartConfig,
    timeRange,
    setTimeRange
}: HasanahTrendChartProps) {
    const filters: { id: TimeRange; label: string }[] = [
        { id: 'today', label: t.stats.chart.filters.today },
        { id: '7d', label: t.stats.chart.filters.last7d },
        { id: '30d', label: t.stats.chart.filters.last30d },
        { id: '90d', label: t.stats.chart.filters.last90d },
        { id: '1y', label: t.stats.chart.filters.last1y },
    ];

    return (
        <div className={cn(
            "rounded-2xl border p-5 overflow-hidden",
            "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-strong))] shadow-[var(--shadow-card)]"
        )}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-bold text-sm flex items-center gap-2">
                    <AppIcon name="target" size="sm" tone="primary" label={t.stats.chart.title} />
                    {t.stats.chart.title} ({filters.find(f => f.id === timeRange)?.label})
                </h2>

                <div className={cn(
                    "grid grid-cols-5 w-full sm:w-auto p-1 rounded-xl border",
                    "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
                )}>
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setTimeRange(f.id)}
                            className={cn(
                                "px-1 py-1.5 rounded-lg text-[10px] sm:px-3 font-bold transition-all whitespace-nowrap text-center",
                                timeRange === f.id
                                    ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]"
                                    : "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-strong))] hover:bg-[rgb(var(--color-surface-subtle))]"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[220px] w-full mt-2 -ml-4">
                <ChartContainer config={chartConfig} className="h-full w-[calc(100%+32px)]">
                    <AreaChart
                        data={chartData}
                        margin={{ left: 12, right: 12, top: 10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="fillHasanah" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-hasanah)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--color-hasanah)" stopOpacity={0.01} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgb(var(--color-border) / 0.55)" />
                        <XAxis
                            dataKey="dateLabel"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={12}
                            tickFormatter={(value) => value}
                            tick={{ fill: 'rgb(var(--color-text-muted) / 0.8)', fontSize: 9, fontWeight: 700 }}
                            interval={timeRange === 'today' ? 3 : timeRange === '7d' ? 0 : 'preserveStartEnd'}
                        />
                        <ChartTooltip
                            cursor={{ stroke: 'rgb(var(--color-border))', strokeWidth: 1 }}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    indicator="dot"
                                    className={cn(
                                        "backdrop-blur-xl rounded-2xl p-3 shadow-2xl min-w-[100px]",
                                        "bg-[rgb(var(--color-surface))]/95 border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-strong))]"
                                    )}
                                />
                            }
                        />
                        <Area
                            dataKey="hasanah"
                            type="monotone"
                            fill="url(#fillHasanah)"
                            fillOpacity={1}
                            stroke="var(--color-hasanah)"
                            strokeWidth={3}
                            stackId="a"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ChartContainer>
            </div>
            <p className="text-[10px] text-center mt-3 text-[rgb(var(--color-text-muted))]">
                {t.stats.chart.subtitle}
            </p>
        </div>
    );
}
