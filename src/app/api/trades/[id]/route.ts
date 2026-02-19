import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { createSupabaseTradesRepository } from "@/infrastructure/supabase/trades-repository";
import { createYahooFinanceSymbolValidator } from "@/infrastructure/yahoo-finance/symbol-validator";
import { UpdateTradeUseCase } from "@/application/usecases/update-trade";
import { DeleteTradeUseCase } from "@/application/usecases/delete-trade";
import type { UpdateTradeInput } from "@/domain/entities/trade";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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
  const updateTrade = new UpdateTradeUseCase(tradesRepo, symbolValidator);
  const { trade, error } = await updateTrade.execute(id, body as UpdateTradeInput);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (!trade) {
    return NextResponse.json(
      { error: "Trade not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ trade });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const tradesRepo = createSupabaseTradesRepository(supabase);
  const deleteTrade = new DeleteTradeUseCase(tradesRepo);
  const { success, error } = await deleteTrade.execute(id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (!success) {
    return NextResponse.json(
      { error: "Failed to delete trade" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
