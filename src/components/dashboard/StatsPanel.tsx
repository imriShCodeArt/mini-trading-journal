"use client";

import { Box, Card, CardContent, Grid, Skeleton, Typography } from "@mui/material";
import type { TradeStats } from "@/domain/services/stats-calculator";

function formatPnl(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

interface StatCardProps {
  label: string;
  value: string;
  isLoading?: boolean;
  color?: "success" | "error" | "inherit";
}

function StatCard({ label, value, isLoading, color = "inherit" }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        {isLoading ? (
          <Skeleton variant="text" width="60%" height={32} />
        ) : (
          <Typography
            variant="h6"
            component="span"
            color={
              color === "success"
                ? "success.main"
                : color === "error"
                  ? "error.main"
                  : undefined
            }
          >
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsPanelProps {
  stats: TradeStats;
  isLoading?: boolean;
}

export function StatsPanel({ stats, isLoading }: StatsPanelProps) {
  const netPnlColor = stats.netPnl > 0 ? "success" : stats.netPnl < 0 ? "error" : "inherit";

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Performance
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Net PnL"
            value={formatPnl(stats.netPnl)}
            isLoading={isLoading}
            color={netPnlColor}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Win Rate"
            value={
              stats.winRate !== null
                ? formatPercent(stats.winRate * 100)
                : "—"
            }
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Avg PnL"
            value={formatPnl(stats.avgPnl)}
            isLoading={isLoading}
            color={stats.avgPnl > 0 ? "success" : stats.avgPnl < 0 ? "error" : "inherit"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Avg % Return"
            value={formatPercent(stats.avgReturnPercent)}
            isLoading={isLoading}
            color={
              stats.avgReturnPercent > 0
                ? "success"
                : stats.avgReturnPercent < 0
                  ? "error"
                  : "inherit"
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Profit Factor"
            value={
              stats.profitFactor !== null
                ? stats.profitFactor.toFixed(2)
                : "—"
            }
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Total Trades"
            value={String(stats.totalTrades)}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
