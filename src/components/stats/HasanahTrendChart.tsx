'use client';

import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface HasanahTrendChartProps {
    t: any;
    chartData: any[];
    chartConfig: ChartConfig;
    timeRange: string;
    setTimeRange: (range: any) => void;
}

export function HasanahTrendChart({
    t,
    chartData,
    chartConfig,
    timeRange,
    setTimeRange
}: HasanahTrendChartProps) {
    const filters = [
        { id: 'today', label: t.stats.chart.filters.today },
        { id: '7d', label: t.stats.chart.filters.last7d },
        { id: '30d', label: t.stats.chart.filters.last30d },
        { id: '90d', label: t.stats.chart.filters.last90d },
        { id: '1y', label: t.stats.chart.filters.last1y },
    ];

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-bold text-sm flex items-center gap-2">
                    <span className="text-base">📈</span>
                    {t.stats.chart.title} ({filters.find(f => f.id === timeRange)?.label})
                </h2>

                <div className="grid grid-cols-5 w-full sm:w-auto bg-white/5 p-1 rounded-xl border border-white/5">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setTimeRange(f.id)}
                            className={cn(
                                "px-1 py-1.5 rounded-lg text-[10px] sm:px-3 font-bold transition-all whitespace-nowrap text-center",
                                timeRange === f.id
                                    ? "bg-[rgb(var(--color-primary))] text-white shadow-lg shadow-primary/20"
                                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
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
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="dateLabel"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={12}
                            tickFormatter={(value) => value}
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 700 }}
                            interval={timeRange === 'today' ? 3 : timeRange === '7d' ? 0 : 'preserveStartEnd'}
                        />
                        <ChartTooltip
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    indicator="dot"
                                    className="bg-[#0A0A0B]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl min-w-[100px]"
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
            <p className="text-[10px] text-white/40 text-center mt-3">
                {t.stats.chart.subtitle}
            </p>
        </div>
    );
}
