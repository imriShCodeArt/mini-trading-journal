import { z } from "zod";

const assetTypeEnum = z.enum(["stock", "crypto", "forex", "index", "other"]);
const sideEnum = z.enum(["long", "short"]);

export const createTradeSchema = z
  .object({
    symbol: z
      .string()
      .min(1, "Symbol is required")
      .max(20)
      .transform((s) => s.toUpperCase().trim()),
    assetType: assetTypeEnum,
    side: sideEnum,
    entryDate: z.coerce.date(),
    exitDate: z.coerce.date(),
    entryPrice: z.number().positive("Entry price must be positive"),
    exitPrice: z.number().positive("Exit price must be positive"),
    positionSize: z.number().positive("Position size must be positive"),
    fees: z.number().min(0).default(0),
    notes: z.string().max(1000).nullable().optional(),
  })
  .refine((data) => data.exitDate >= data.entryDate, {
    message: "Exit date must be on or after entry date",
    path: ["exitDate"],
  });

export const updateTradeSchema = createTradeSchema.partial();

export type CreateTradeSchema = z.infer<typeof createTradeSchema>;
export type UpdateTradeSchema = z.infer<typeof updateTradeSchema>;
