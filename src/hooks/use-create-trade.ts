"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTradeInput } from "@/domain/entities/trade";

async function createTrade(input: CreateTradeInput): Promise<{ trade: unknown }> {
  const res = await fetch("/api/trades", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      entryDate: input.entryDate.toISOString(),
      exitDate: input.exitDate.toISOString(),
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error(data.error ?? "Failed to create trade");
  }

  return data;
}

export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}
