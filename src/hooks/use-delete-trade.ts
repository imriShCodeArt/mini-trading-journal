"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteTrade(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/trades/${id}`, {
    method: "DELETE",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error(data.error ?? "Failed to delete trade");
  }

  return data;
}

interface UseDeleteTradeOptions {
  onError?: (error: Error) => void;
}

export function useDeleteTrade(options?: UseDeleteTradeOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
    onError: options?.onError,
  });
}
