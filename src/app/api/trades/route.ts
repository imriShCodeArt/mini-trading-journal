import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { createSupabaseTradesRepository } from "@/infrastructure/supabase/trades-repository";
import { createYahooFinanceSymbolValidator } from "@/infrastructure/yahoo-finance/symbol-validator";
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
  const parseResult = parseListOptions(searchParams);
  if (parseResult.error) {
    return NextResponse.json(
      { error: parseResult.error },
      { status: 400 }
    );
  }
  const options = parseResult.options;

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
  const symbolValidator = createYahooFinanceSymbolValidator();
  const createTrade = new CreateTradeUseCase(tradesRepo, symbolValidator);
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

function parseDateParam(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseListOptions(
  searchParams: URLSearchParams
): { options?: ListTradesOptions; error?: string } {
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

  if (dateFrom) {
    const parsed = parseDateParam(dateFrom);
    if (!parsed) {
      return { error: `Invalid dateFrom format: "${dateFrom}". Use ISO 8601 (e.g. YYYY-MM-DD).` };
    }
  }
  if (dateTo) {
    const parsed = parseDateParam(dateTo);
    if (!parsed) {
      return { error: `Invalid dateTo format: "${dateTo}". Use ISO 8601 (e.g. YYYY-MM-DD).` };
    }
  }

  if (!symbol && !assetType && !dateFrom && !dateTo && !sortField && !sortOrder) {
    return { options: undefined };
  }

  const options: ListTradesOptions = {};

  if (symbol || assetType || dateFrom || dateTo) {
    options.filters = {};
    if (symbol) options.filters.symbol = symbol;
    if (assetType) options.filters.assetType = assetType;
    if (dateFrom) options.filters.dateFrom = parseDateParam(dateFrom)!;
    if (dateTo) options.filters.dateTo = parseDateParam(dateTo)!;
  }

  if (sortField && sortOrder) {
    options.sort = { field: sortField, order: sortOrder };
  }

  return { options };
}
