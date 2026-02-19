import type {
  Trade,
  TradeWithComputed,
  CreateTradeInput,
  UpdateTradeInput,
} from "@/domain/entities/trade";

export interface ListTradesFilters {
  symbol?: string;
  assetType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ListTradesSort {
  field: "exit_date" | "pnl" | "entry_date";
  order: "asc" | "desc";
}

export interface ListTradesOptions {
  filters?: ListTradesFilters;
  sort?: ListTradesSort;
  limit?: number;
  offset?: number;
}

export interface TradesRepository {
  list(options?: ListTradesOptions): Promise<Trade[]>;
  getById(id: string): Promise<Trade | null>;
  create(input: CreateTradeInput, userId: string): Promise<Trade>;
  update(id: string, input: UpdateTradeInput): Promise<Trade | null>;
  delete(id: string): Promise<boolean>;
}
