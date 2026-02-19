import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { createSupabaseTradesRepository } from "@/infrastructure/supabase/trades-repository";
import { ListTradesUseCase } from "@/application/usecases/list-trades";
import { CreateTradeUseCase } from "@/application/usecases/create-trade";
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

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const tradesRepo = createSupabaseTradesRepository(supabase);
  const createTrade = new CreateTradeUseCase(tradesRepo);
  const { trade, error } = await createTrade.execute(body as Parameters<CreateTradeUseCase["execute"]>[0], user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (!trade) {
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }

  return NextResponse.json({ trade });
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
