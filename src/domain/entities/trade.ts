export type AssetType = "stock" | "crypto" | "forex" | "index" | "other";
export type TradeSide = "long" | "short";

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  assetType: AssetType;
  side: TradeSide;
  entryDate: Date;
  exitDate: Date;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  fees: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Computed fields (not stored in DB) */
export interface TradeWithComputed extends Trade {
  pnl: number;
  pnlPercent: number;
  holdingTimeMs: number;
}

export interface CreateTradeInput {
  symbol: string;
  assetType: AssetType;
  side: TradeSide;
  entryDate: Date;
  exitDate: Date;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  fees?: number;
  notes?: string | null;
}

export interface UpdateTradeInput {
  symbol?: string;
  assetType?: AssetType;
  side?: TradeSide;
  entryDate?: Date;
  exitDate?: Date;
  entryPrice?: number;
  exitPrice?: number;
  positionSize?: number;
  fees?: number;
  notes?: string | null;
}
