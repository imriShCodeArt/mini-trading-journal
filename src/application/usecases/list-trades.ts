import type { TradeWithComputed } from "@/domain/entities/trade";
import type {
  TradesRepository,
  ListTradesOptions,
} from "../ports/trades-repository";
import { enrichTradeWithComputed } from "@/domain/services/trade-calculator";

export class ListTradesUseCase {
  constructor(private tradesRepo: TradesRepository) {}

  async execute(
    options?: ListTradesOptions
  ): Promise<{ trades: TradeWithComputed[]; error: Error | null }> {
    try {
      const trades = await this.tradesRepo.list(options);
      let enriched = trades.map(enrichTradeWithComputed);

      if (options?.sort?.field === "pnl") {
        const asc = options.sort.order === "asc";
        enriched = enriched.sort((a, b) =>
          asc ? a.pnl - b.pnl : b.pnl - a.pnl
        );
        // Apply limit/offset after PnL sort (repo skips them for pnl sort)
        const limit = options?.limit ?? 500;
        const offset = options?.offset ?? 0;
        enriched = enriched.slice(offset, offset + limit);
      }

      return { trades: enriched, error: null };
    } catch (err) {
      return {
        trades: [],
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }
}
