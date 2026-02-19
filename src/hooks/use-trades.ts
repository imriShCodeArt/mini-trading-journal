"use client";

import { useQuery } from "@tanstack/react-query";
import type { TradeWithComputed } from "@/domain/entities/trade";
import type { ListTradesOptions } from "@/application/ports/trades-repository";

async function fetchTrades(
  options?: ListTradesOptions
): Promise<TradeWithComputed[]> {
  const params = new URLSearchParams();
  if (options?.filters?.symbol) params.set("symbol", options.filters.symbol);
  if (options?.filters?.assetType)
    params.set("assetType", options.filters.assetType);
  if (options?.filters?.dateFrom)
    params.set("dateFrom", options.filters.dateFrom.toISOString());
  if (options?.filters?.dateTo)
    params.set("dateTo", options.filters.dateTo.toISOString());
  if (options?.sort?.field) params.set("sortField", options.sort.field);
  if (options?.sort?.order) params.set("sortOrder", options.sort.order);

  const url = `/api/trades${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to fetch trades");
  }

  const data = await res.json();
  return (data.trades ?? []).map((t: Record<string, unknown>) => ({
    ...t,
    entryDate: new Date(t.entryDate as string),
    exitDate: new Date(t.exitDate as string),
    createdAt: new Date(t.createdAt as string),
    updatedAt: new Date(t.updatedAt as string),
  })) as TradeWithComputed[];
}

export function useTrades(options?: ListTradesOptions) {
  return useQuery({
    queryKey: ["trades", options],
    queryFn: () => fetchTrades(options),
  });
}
