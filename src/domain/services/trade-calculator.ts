import type { Trade, TradeSide } from "../entities/trade";

/**
 * Computes PnL for a trade.
 * Long: (exit - entry) * size - fees
 * Short: (entry - exit) * size - fees
 */
export function computePnl(
  entryPrice: number,
  exitPrice: number,
  positionSize: number,
  side: TradeSide,
  fees: number = 0
): number {
  const grossPnl =
    side === "long"
      ? (exitPrice - entryPrice) * positionSize
      : (entryPrice - exitPrice) * positionSize;
  return grossPnl - fees;
}

/**
 * Computes PnL as percentage of cost basis (entry * size).
 */
export function computePnlPercent(
  entryPrice: number,
  exitPrice: number,
  positionSize: number,
  side: TradeSide,
  fees: number = 0
): number {
  const grossPnl =
    side === "long"
      ? (exitPrice - entryPrice) * positionSize
      : (entryPrice - exitPrice) * positionSize;
  const netPnl = grossPnl - fees;
  const costBasis = entryPrice * positionSize;
  return costBasis > 0 ? (netPnl / costBasis) * 100 : 0;
}

/**
 * Adds computed fields to a trade.
 */
export function enrichTradeWithComputed(trade: Trade) {
  const pnl = computePnl(
    trade.entryPrice,
    trade.exitPrice,
    trade.positionSize,
    trade.side,
    trade.fees
  );
  const pnlPercent = computePnlPercent(
    trade.entryPrice,
    trade.exitPrice,
    trade.positionSize,
    trade.side,
    trade.fees
  );
  const holdingTimeMs = trade.exitDate.getTime() - trade.entryDate.getTime();

  return {
    ...trade,
    pnl,
    pnlPercent,
    holdingTimeMs,
  };
}
