import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import type { AssetType } from "@/domain/entities/trade";

const yahooFinance = new YahooFinance();

const QUOTE_TYPE_MAP: Record<AssetType, string[]> = {
  stock: ["EQUITY", "ETF"],
  crypto: ["CRYPTOCURRENCY"],
  forex: ["CURRENCY"],
  index: ["INDEX"],
  other: ["EQUITY", "ETF", "CRYPTOCURRENCY", "CURRENCY", "INDEX", "MUTUALFUND"],
};

export interface SymbolSuggestion {
  symbol: string;
  name: string;
  type?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const assetType = (searchParams.get("assetType") ?? "stock") as AssetType;

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const result = await yahooFinance.search(q, {
      quotesCount: 15,
      newsCount: 0,
    });

    const allowedTypes = QUOTE_TYPE_MAP[assetType] ?? QUOTE_TYPE_MAP.stock;
    const suggestions: SymbolSuggestion[] = (result.quotes ?? [])
      .filter(
        (quote): quote is { symbol: string; shortname?: string; longname?: string; quoteType?: string; isYahooFinance?: boolean } =>
          "isYahooFinance" in quote &&
          quote.isYahooFinance === true &&
          "symbol" in quote &&
          typeof quote.symbol === "string" &&
          (!quote.quoteType || allowedTypes.includes(quote.quoteType))
      )
      .map((quote) => ({
        symbol: quote.symbol,
        name: quote.shortname ?? quote.longname ?? quote.symbol,
        type: quote.quoteType,
      }))
      .slice(0, 10);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
