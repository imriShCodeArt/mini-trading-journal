"use client";

import { useMemo } from "react";
import { computeStats } from "@/domain/services/stats-calculator";
import type { TradeStats } from "@/domain/services/stats-calculator";
import type { TradeWithComputed } from "@/domain/entities/trade";
import { useTrades } from "./use-trades";
import type { ListTradesOptions } from "@/application/ports/trades-repository";

export function useStats(options?: ListTradesOptions): {
  stats: TradeStats;
  isLoading: boolean;
  error: Error | null;
} {
  const { data: trades, isLoading, error } = useTrades(options);

  const stats = useMemo(() => {
    return computeStats((trades ?? []) as TradeWithComputed[]);
  }, [trades]);

  return {
    stats,
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
