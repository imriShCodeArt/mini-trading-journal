import type { AssetType } from "@/domain/entities/trade";

export interface SymbolValidator {
  /**
   * Returns true if the symbol is valid for the given asset type.
   * For "stock", validates against a real-time data source.
   * For other types, may return true (skip validation) or validate if supported.
   */
  isValid(symbol: string, assetType: AssetType): Promise<boolean>;
}
