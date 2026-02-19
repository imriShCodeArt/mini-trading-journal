import type { Trade, UpdateTradeInput } from "@/domain/entities/trade";
import type { TradesRepository } from "../ports/trades-repository";
import type { SymbolValidator } from "../ports/symbol-validator";
import { updateTradeSchema } from "@/domain/validation/trade-schema";

export class UpdateTradeUseCase {
  constructor(
    private tradesRepo: TradesRepository,
    private symbolValidator?: SymbolValidator
  ) {}

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

    if (
      this.symbolValidator &&
      parsed.data.symbol !== undefined &&
      parsed.data.assetType !== undefined
    ) {
      const valid = await this.symbolValidator.isValid(
        parsed.data.symbol,
        parsed.data.assetType
      );
      if (!valid) {
        return {
          trade: null,
          error: new Error(
            `Symbol "${parsed.data.symbol}" is not a valid ${parsed.data.assetType}. Please check the symbol and try again.`
          ),
        };
      }
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
