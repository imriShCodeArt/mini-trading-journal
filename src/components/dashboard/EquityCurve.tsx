"use client";

import { useMemo } from "react";
import { Box, Paper, Skeleton, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { computeEquityCurve } from "@/domain/services/stats-calculator";
import type { TradeWithComputed } from "@/domain/entities/trade";

interface EquityCurveProps {
  trades: TradeWithComputed[];
  isLoading?: boolean;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPnl(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function EquityCurve({ trades, isLoading }: EquityCurveProps) {
  const chartData = useMemo(() => {
    const curve = computeEquityCurve(trades);
    return curve.map(({ date, cumulativePnl }) => ({
      date: formatDate(date),
      cumulativePnl,
      label: formatPnl(cumulativePnl),
    }));
  }, [trades]);

  if (isLoading) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Equity Curve
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, height: 280 }}>
          <Skeleton variant="rectangular" height={240} />
        </Paper>
      </Box>
    );
  }

  if (trades.length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Equity Curve
        </Typography>
        <Paper variant="outlined" sx={{ py: 6, textAlign: "center" }}>
          <Typography color="text.secondary">
            Add trades to see your equity curve.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Equity Curve
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatPnl(v)}
              tick={{ fontSize: 12 }}
              tickLine={false}
              width={70}
            />
            <Tooltip
              formatter={(value) =>
                [
                  formatPnl(typeof value === "number" ? value : 0),
                  "Cumulative PnL",
                ] as [string, string]
              }
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="cumulativePnl"
              stroke="var(--mui-palette-primary-main)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
