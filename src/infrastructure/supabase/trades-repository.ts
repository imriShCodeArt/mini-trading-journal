import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  TradesRepository,
  ListTradesFilters,
  ListTradesSort,
  ListTradesOptions,
} from "@/application/ports/trades-repository";
import type {
  Trade,
  CreateTradeInput,
  UpdateTradeInput,
} from "@/domain/entities/trade";
import { rowToTrade, tradeToRow } from "./mappers";

export type SupabaseClientLike = SupabaseClient;

export function createSupabaseTradesRepository(
  supabase: SupabaseClientLike
): TradesRepository {
  return {
    async list(options?: ListTradesOptions): Promise<Trade[]> {
      const sortField = options?.sort?.field ?? "exit_date";
      const dbSortField = sortField === "pnl" ? "exit_date" : sortField;

      let query = supabase
        .from("trades")
        .select("*")
        .order(dbSortField, { ascending: options?.sort?.order === "asc" });

      const filters = options?.filters;
      if (filters?.symbol) {
        query = query.ilike("symbol", filters.symbol);
      }
      if (filters?.assetType) {
        query = query.eq("asset_type", filters.assetType);
      }
      if (filters?.dateFrom) {
        query = query.gte("exit_date", filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte("exit_date", filters.dateTo.toISOString());
      }

      const limit = options?.limit ?? 500;
      const offset = options?.offset ?? 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(rowToTrade);
    },

    async getById(id: string): Promise<Trade | null> {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data ? rowToTrade(data) : null;
    },

    async create(input: CreateTradeInput, userId: string): Promise<Trade> {
      const row = tradeToRow(input, userId);
      const { data, error } = await supabase
        .from("trades")
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return rowToTrade(data);
    },

    async update(id: string, input: UpdateTradeInput): Promise<Trade | null> {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (input.symbol !== undefined) patch.symbol = input.symbol.toUpperCase().trim();
      if (input.assetType !== undefined) patch.asset_type = input.assetType;
      if (input.side !== undefined) patch.side = input.side;
      if (input.entryDate !== undefined) patch.entry_date = input.entryDate.toISOString();
      if (input.exitDate !== undefined) patch.exit_date = input.exitDate.toISOString();
      if (input.entryPrice !== undefined) patch.entry_price = input.entryPrice;
      if (input.exitPrice !== undefined) patch.exit_price = input.exitPrice;
      if (input.positionSize !== undefined) patch.position_size = input.positionSize;
      if (input.fees !== undefined) patch.fees = input.fees;
      if (input.notes !== undefined) patch.notes = input.notes;

      const { data, error } = await supabase
        .from("trades")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data ? rowToTrade(data) : null;
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase.from("trades").delete().eq("id", id);
      if (error) throw error;
      return true;
    },
  };
}
