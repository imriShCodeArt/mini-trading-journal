import type { Trade, UpdateTradeInput } from "@/domain/entities/trade";
import type { TradesRepository } from "../ports/trades-repository";
import { updateTradeSchema } from "@/domain/validation/trade-schema";

export class UpdateTradeUseCase {
  constructor(private tradesRepo: TradesRepository) {}

  async execute(
    id: string,
    input: UpdateTradeInput
  ): Promise<{ trade: Trade | null; error: Error | null }> {
    const parsed = updateTradeSchema.safeParse(input);
    if (!parsed.success) {
      return {
        trade: null,
        error: new Error(
          parsed.error.issues.map((e) => e.message ?? String(e)).join(", ")
        ),
      };
    }

    try {
      const trade = await this.tradesRepo.update(id, parsed.data);
      return { trade, error: null };
    } catch (err) {
      return {
        trade: null,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }
}
