/**
 * Factory for creating use cases with Supabase-backed repositories.
 * Use createSupabaseServerClient() in server components/actions,
 * or createSupabaseBrowserClient() in client components.
 */
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { createSupabaseTradesRepository } from "@/infrastructure/supabase/trades-repository";
import { createSupabaseAuthRepository } from "@/infrastructure/supabase/auth-repository";
import { CreateTradeUseCase } from "@/application/usecases/create-trade";
import { UpdateTradeUseCase } from "@/application/usecases/update-trade";
import { DeleteTradeUseCase } from "@/application/usecases/delete-trade";
import { ListTradesUseCase } from "@/application/usecases/list-trades";
import { GetStatsUseCase } from "@/application/usecases/get-stats";

export async function createTradesUseCases() {
  const supabase = await createSupabaseServerClient();
  const tradesRepo = createSupabaseTradesRepository(supabase);

  const listTrades = new ListTradesUseCase(tradesRepo);

  return {
    createTrade: new CreateTradeUseCase(tradesRepo),
    updateTrade: new UpdateTradeUseCase(tradesRepo),
    deleteTrade: new DeleteTradeUseCase(tradesRepo),
    listTrades,
    getStats: new GetStatsUseCase(listTrades),
  };
}

export async function createAuthUseCase() {
  const supabase = await createSupabaseServerClient();
  return createSupabaseAuthRepository(supabase);
}
