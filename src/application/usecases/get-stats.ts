import type { TradeStats } from "@/domain/services/stats-calculator";
import { computeStats } from "@/domain/services/stats-calculator";
import type { ListTradesUseCase } from "./list-trades";
import type { ListTradesOptions } from "../ports/trades-repository";

export class GetStatsUseCase {
  constructor(private listTrades: ListTradesUseCase) {}

  async execute(
    options?: ListTradesOptions
  ): Promise<{ stats: TradeStats; error: Error | null }> {
    const { trades, error } = await this.listTrades.execute(options);
    if (error) {
      return {
        stats: {
          netPnl: 0,
          winRate: null,
          avgPnl: 0,
          avgReturnPercent: 0,
          profitFactor: null,
          wins: 0,
          losses: 0,
          totalTrades: 0,
        },
        error,
      };
    }
    const stats = computeStats(trades);
    return { stats, error: null };
  }
}
