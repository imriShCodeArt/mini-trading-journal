import type { CreateTradeInput, Trade } from "@/domain/entities/trade";
import type { TradesRepository } from "../ports/trades-repository";
import { createTradeSchema } from "@/domain/validation/trade-schema";

export class CreateTradeUseCase {
  constructor(private tradesRepo: TradesRepository) {}

  async execute(
    input: CreateTradeInput,
    userId: string
  ): Promise<{ trade: Trade | null; error: Error | null }> {
    const parsed = createTradeSchema.safeParse(input);
    if (!parsed.success) {
      return {
        trade: null,
        error: new Error(
          parsed.error.issues.map((e) => e.message ?? String(e)).join(", ")
        ),
      };
    }

    try {
      const trade = await this.tradesRepo.create(
        {
          ...parsed.data,
          entryDate: parsed.data.entryDate,
          exitDate: parsed.data.exitDate,
        },
        userId
      );
      return { trade, error: null };
    } catch (err) {
      return {
        trade: null,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }
}
