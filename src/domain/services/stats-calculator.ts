import type { TradeWithComputed } from "../entities/trade";

export interface TradeStats {
  netPnl: number;
  winRate: number | null;
  avgPnl: number;
  avgReturnPercent: number;
  profitFactor: number | null;
  wins: number;
  losses: number;
  totalTrades: number;
}

/**
 * Computes aggregate stats from a list of trades with computed PnL.
 */
export function computeStats(trades: TradeWithComputed[]): TradeStats {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return {
      netPnl: 0,
      winRate: null,
      avgPnl: 0,
      avgReturnPercent: 0,
      profitFactor: null,
      wins: 0,
      losses: 0,
      totalTrades: 0,
    };
  }

  const netPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const wins = trades.filter((t) => t.pnl > 0).length;
  const losses = trades.filter((t) => t.pnl < 0).length;
  const winRate = wins + losses > 0 ? wins / (wins + losses) : null;
  const avgPnl = netPnl / totalTrades;
  const avgReturnPercent =
    trades.reduce((sum, t) => sum + t.pnlPercent, 0) / totalTrades;

  const sumWins = trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const sumLosses = Math.abs(
    trades.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0)
  );
  const profitFactor = sumLosses > 0 ? sumWins / sumLosses : null;

  return {
    netPnl,
    winRate,
    avgPnl,
    avgReturnPercent,
    profitFactor,
    wins,
    losses,
    totalTrades,
  };
}

/**
 * Builds equity curve: sorted by exit_date asc, cumulative PnL.
 * Includes a starting point (0) so the chart always has at least 2 points.
 */
export function computeEquityCurve(
  trades: TradeWithComputed[]
): { date: Date; cumulativePnl: number }[] {
  if (trades.length === 0) return [];

  const sorted = [...trades].sort(
    (a, b) => a.exitDate.getTime() - b.exitDate.getTime()
  );
  const firstDate = sorted[0]!.exitDate;
  const startDate = new Date(firstDate.getTime() - 24 * 60 * 60 * 1000);

  const result: { date: Date; cumulativePnl: number }[] = [
    { date: startDate, cumulativePnl: 0 },
  ];
  let cumulative = 0;
  for (const t of sorted) {
    cumulative += t.pnl;
    result.push({ date: t.exitDate, cumulativePnl: cumulative });
  }
  return result;
}
