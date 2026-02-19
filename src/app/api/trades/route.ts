import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { createSupabaseTradesRepository } from "@/infrastructure/supabase/trades-repository";
import { ListTradesUseCase } from "@/application/usecases/list-trades";
import type { ListTradesOptions } from "@/application/ports/trades-repository";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const options = parseListOptions(searchParams);

  const tradesRepo = createSupabaseTradesRepository(supabase);
  const listTrades = new ListTradesUseCase(tradesRepo);
  const { trades, error } = await listTrades.execute(options);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ trades });
}

function parseListOptions(
  searchParams: URLSearchParams
): ListTradesOptions | undefined {
  const symbol = searchParams.get("symbol") ?? undefined;
  const assetType = searchParams.get("assetType") ?? undefined;
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const sortField = searchParams.get("sortField") as
    | "exit_date"
    | "pnl"
    | "entry_date"
    | null;
  const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | null;

  if (!symbol && !assetType && !dateFrom && !dateTo && !sortField && !sortOrder) {
    return undefined;
  }

  const options: ListTradesOptions = {};

  if (symbol || assetType || dateFrom || dateTo) {
    options.filters = {};
    if (symbol) options.filters.symbol = symbol;
    if (assetType) options.filters.assetType = assetType;
    if (dateFrom) options.filters.dateFrom = new Date(dateFrom);
    if (dateTo) options.filters.dateTo = new Date(dateTo);
  }

  if (sortField && sortOrder) {
    options.sort = { field: sortField, order: sortOrder };
  }

  return options;
}
