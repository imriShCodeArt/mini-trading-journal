import YahooFinance from "yahoo-finance2";
import type { SymbolValidator } from "@/application/ports/symbol-validator";
import type { AssetType } from "@/domain/entities/trade";

const yahooFinance = new YahooFinance();

/**
 * Validates stock symbols using Yahoo Finance.
 * Only validates when assetType is "stock"; other types are allowed without validation.
 */
export function createYahooFinanceSymbolValidator(): SymbolValidator {
  return {
    async isValid(symbol: string, assetType: AssetType): Promise<boolean> {
      if (assetType !== "stock") {
        return true;
      }

      const trimmed = symbol.toUpperCase().trim();
      if (!trimmed) return false;

      try {
        const quote = await yahooFinance.quote(trimmed);
        return !!quote && !!quote.symbol;
      } catch {
        return false;
      }
    },
  };
}
