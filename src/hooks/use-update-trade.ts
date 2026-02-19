"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTradeInput } from "@/domain/entities/trade";

async function updateTrade(
  id: string,
  input: UpdateTradeInput
): Promise<{ trade: unknown }> {
  const body: Record<string, unknown> = { ...input };
  if (input.entryDate) body.entryDate = input.entryDate.toISOString();
  if (input.exitDate) body.exitDate = input.exitDate.toISOString();

  const res = await fetch(`/api/trades/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error(data.error ?? "Failed to update trade");
  }

  return data;
}

interface UseUpdateTradeOptions {
  onError?: (error: Error) => void;
}

export function useUpdateTrade(options?: UseUpdateTradeOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTradeInput }) =>
      updateTrade(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
    onError: options?.onError,
  });
}
