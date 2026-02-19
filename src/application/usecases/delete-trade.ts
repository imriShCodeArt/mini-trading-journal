import type { TradesRepository } from "../ports/trades-repository";

export class DeleteTradeUseCase {
  constructor(private tradesRepo: TradesRepository) {}

  async execute(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const success = await this.tradesRepo.delete(id);
      return { success, error: null };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }
}
