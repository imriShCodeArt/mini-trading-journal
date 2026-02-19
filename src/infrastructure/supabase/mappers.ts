import type { Trade, CreateTradeInput } from "@/domain/entities/trade";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface TradeRow {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: string;
  side: string;
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  position_size: number;
  fees: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function rowToTrade(row: TradeRow): Trade {
  return {
    id: row.id,
    userId: row.user_id,
    symbol: row.symbol,
    assetType: row.asset_type as Trade["assetType"],
    side: row.side as Trade["side"],
    entryDate: new Date(row.entry_date),
    exitDate: new Date(row.exit_date),
    entryPrice: Number(row.entry_price),
    exitPrice: Number(row.exit_price),
    positionSize: Number(row.position_size),
    fees: Number(row.fees ?? 0),
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function tradeToRow(
  input: CreateTradeInput,
  userId: string
): Omit<TradeRow, "id" | "created_at" | "updated_at"> {
  return {
    user_id: userId,
    symbol: input.symbol.toUpperCase().trim(),
    asset_type: input.assetType,
    side: input.side,
    entry_date: input.entryDate.toISOString(),
    exit_date: input.exitDate.toISOString(),
    entry_price: input.entryPrice,
    exit_price: input.exitPrice,
    position_size: input.positionSize,
    fees: input.fees ?? 0,
    notes: input.notes ?? null,
  };
}
