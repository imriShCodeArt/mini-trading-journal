"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import type { CreateTradeInput } from "@/domain/entities/trade";

const assetTypeEnum = z.enum(["stock", "crypto", "forex", "index", "other"]);
const sideEnum = z.enum(["long", "short"]);

const tradeFormSchema = z
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
    entryPrice: z.coerce.number().positive("Entry price must be positive"),
    exitPrice: z.coerce.number().positive("Exit price must be positive"),
    positionSize: z.coerce.number().positive("Position size must be positive"),
    fees: z.coerce.number().min(0).default(0),
    notes: z
      .string()
      .max(1000, "Notes must be 1000 characters or less")
      .optional()
      .transform((s) => (s?.trim() ? s.trim() : null)),
  })
  .refine((data) => data.exitDate >= data.entryDate, {
    message: "Exit date must be on or after entry date",
    path: ["exitDate"],
  });

type TradeFormValues = z.infer<typeof tradeFormSchema>;

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface TradeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTradeInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function TradeFormDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: TradeFormDialogProps) {
  const now = new Date();
  const defaultEntry = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const defaultExit = now;

  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema) as Resolver<TradeFormValues>,
    defaultValues: {
      symbol: "",
      assetType: "stock",
      side: "long",
      entryDate: defaultEntry,
      exitDate: defaultExit,
      entryPrice: 0,
      exitPrice: 0,
      positionSize: 0,
      fees: 0,
      notes: "",
    },
  });

  const handleClose = () => {
    setServerError(null);
    reset();
    onClose();
  };

  async function handleFormSubmit(values: TradeFormValues) {
    setServerError(null);
    try {
      await onSubmit({
        symbol: values.symbol,
        assetType: values.assetType,
        side: values.side,
        entryDate: values.entryDate,
        exitDate: values.exitDate,
        entryPrice: values.entryPrice,
        exitPrice: values.exitPrice,
        positionSize: values.positionSize,
        fees: values.fees,
        notes: values.notes,
      });
      handleClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to add trade");
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>Add Trade</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {serverError && (
            <FormHelperText error sx={{ mx: 0 }}>
              {serverError}
            </FormHelperText>
          )}
          <TextField
            label="Symbol"
            {...register("symbol")}
            error={!!errors.symbol}
            helperText={errors.symbol?.message}
            fullWidth
            required
            autoFocus
          />

          <Controller
            name="assetType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.assetType}>
                <InputLabel>Asset Type</InputLabel>
                <Select {...field} label="Asset Type">
                  <MenuItem value="stock">Stock</MenuItem>
                  <MenuItem value="crypto">Crypto</MenuItem>
                  <MenuItem value="forex">Forex</MenuItem>
                  <MenuItem value="index">Index</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.assetType && (
                  <FormHelperText>{errors.assetType.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="side"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.side}>
                <InputLabel>Side</InputLabel>
                <Select {...field} label="Side">
                  <MenuItem value="long">Long</MenuItem>
                  <MenuItem value="short">Short</MenuItem>
                </Select>
                {errors.side && (
                  <FormHelperText>{errors.side.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="entryDate"
            control={control}
            render={({ field }) => (
              <TextField
                label="Entry Date & Time"
                type="datetime-local"
                {...field}
                value={
                  field.value instanceof Date
                    ? toDatetimeLocal(field.value)
                    : field.value ?? ""
                }
                onChange={(e) => field.onChange(new Date(e.target.value))}
                error={!!errors.entryDate}
                helperText={errors.entryDate?.message}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Controller
            name="exitDate"
            control={control}
            render={({ field }) => (
              <TextField
                label="Exit Date & Time"
                type="datetime-local"
                {...field}
                value={
                  field.value instanceof Date
                    ? toDatetimeLocal(field.value)
                    : field.value ?? ""
                }
                onChange={(e) => field.onChange(new Date(e.target.value))}
                error={!!errors.exitDate}
                helperText={errors.exitDate?.message}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <TextField
            label="Entry Price"
            type="number"
            inputProps={{ step: "any", min: 0 }}
            {...register("entryPrice", { valueAsNumber: true })}
            error={!!errors.entryPrice}
            helperText={errors.entryPrice?.message}
            fullWidth
            required
          />

          <TextField
            label="Exit Price"
            type="number"
            inputProps={{ step: "any", min: 0 }}
            {...register("exitPrice", { valueAsNumber: true })}
            error={!!errors.exitPrice}
            helperText={errors.exitPrice?.message}
            fullWidth
            required
          />

          <TextField
            label="Position Size"
            type="number"
            inputProps={{ step: "any", min: 0 }}
            {...register("positionSize", { valueAsNumber: true })}
            error={!!errors.positionSize}
            helperText={errors.positionSize?.message}
            fullWidth
            required
          />

          <TextField
            label="Fees (optional)"
            type="number"
            inputProps={{ step: "any", min: 0 }}
            {...register("fees", { valueAsNumber: true })}
            error={!!errors.fees}
            helperText={errors.fees?.message}
            fullWidth
          />

          <TextField
            label="Notes (optional)"
            {...register("notes")}
            error={!!errors.notes}
            helperText={errors.notes?.message}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add Trade"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
