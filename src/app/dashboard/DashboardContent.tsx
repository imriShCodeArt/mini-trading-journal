"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import Link from "@/components/Link";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { TradeTable } from "@/components/dashboard/TradeTable";
import { TradeFormDialog } from "@/components/dashboard/TradeFormDialog";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { useToast } from "@/components/ToastProvider";
import { useStats } from "@/hooks/use-stats";
import { useTrades } from "@/hooks/use-trades";
import { useCreateTrade } from "@/hooks/use-create-trade";
import { useUpdateTrade } from "@/hooks/use-update-trade";
import { useDeleteTrade } from "@/hooks/use-delete-trade";
import type {
  CreateTradeInput,
  TradeWithComputed,
  UpdateTradeInput,
} from "@/domain/entities/trade";
import type {
  ListTradesFilters,
  ListTradesSort,
} from "@/application/ports/trades-repository";

interface DashboardContentProps {
  userEmail?: string;
}

export function DashboardContent({ userEmail }: DashboardContentProps) {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<TradeWithComputed | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<TradeWithComputed | null>(
    null
  );
  const [filters, setFilters] = useState<ListTradesFilters>({});
  const [sort, setSort] = useState<ListTradesSort>({
    field: "exit_date",
    order: "desc",
  });
  const listOptions = useMemo(
    () => ({
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sort,
    }),
    [filters, sort]
  );
  const toast = useToast();
  const { data: trades, isLoading: tradesLoading, error: tradesError } =
    useTrades(listOptions);
  const { stats, isLoading: statsLoading } = useStats(listOptions);

  useEffect(() => {
    if (tradesError) {
      toast.showError(tradesError.message);
    }
  }, [tradesError, toast]);
  const createTrade = useCreateTrade({
    onError: (err) => toast.showError(err.message),
  });
  const updateTrade = useUpdateTrade({
    onError: (err) => toast.showError(err.message),
  });
  const deleteTrade = useDeleteTrade({
    onError: (err) => toast.showError(err.message),
  });

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleAddTrade(input: CreateTradeInput) {
    await createTrade.mutateAsync(input);
    toast.showSuccess("Trade added successfully");
  }

  async function handleEditTrade(id: string, input: UpdateTradeInput) {
    await updateTrade.mutateAsync({ id, input });
    toast.showSuccess("Trade updated successfully");
  }

  function handleEditClick(trade: TradeWithComputed) {
    setTradeToEdit(trade);
    setEditDialogOpen(true);
  }

  function handleDeleteClick(trade: TradeWithComputed) {
    setTradeToDelete(trade);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!tradeToDelete) return;
    await deleteTrade.mutateAsync(tradeToDelete.id);
    toast.showSuccess("Trade deleted successfully");
    setTradeToDelete(null);
    setDeleteDialogOpen(false);
  }

  function handleClearFilters() {
    setFilters({});
    setSort({ field: "exit_date", order: "desc" });
  }

  const isLoading = tradesLoading || statsLoading;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            href="/dashboard"
            sx={{ textDecoration: "none", color: "inherit", flexGrow: 1 }}
          >
            Mini Trading Journal
          </Typography>
          {userEmail && (
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {userEmail}
            </Typography>
          )}
          <Button color="inherit" onClick={handleSignOut}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            Dashboard
          </Typography>
          <Button
            variant="contained"
            onClick={() => setAddDialogOpen(true)}
          >
            Add trade
          </Button>
        </Box>
        <StatsPanel stats={stats} isLoading={isLoading} />
        <EquityCurve trades={trades ?? []} isLoading={isLoading} />
        <FiltersBar
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
          onClear={handleClearFilters}
        />
        <TradeTable
          trades={trades ?? []}
          isLoading={isLoading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </Container>

      <TradeFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddTrade}
        isSubmitting={createTrade.isPending}
      />

      <TradeFormDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setTradeToEdit(null);
        }}
        onSubmit={handleAddTrade}
        onEditSubmit={handleEditTrade}
        trade={tradeToEdit}
        isSubmitting={updateTrade.isPending}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Trade"
        message={
          tradeToDelete
            ? `Are you sure you want to delete the trade ${tradeToDelete.symbol}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setTradeToDelete(null);
        }}
        isSubmitting={deleteTrade.isPending}
      />
    </Box>
  );
}
