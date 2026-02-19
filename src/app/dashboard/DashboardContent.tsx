"use client";

import { useState } from "react";
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
import { useStats } from "@/hooks/use-stats";
import { useTrades } from "@/hooks/use-trades";
import { useCreateTrade } from "@/hooks/use-create-trade";
import type { CreateTradeInput } from "@/domain/entities/trade";

interface DashboardContentProps {
  userEmail?: string;
}

export function DashboardContent({ userEmail }: DashboardContentProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: trades, isLoading: tradesLoading } = useTrades();
  const { stats, isLoading: statsLoading } = useStats();
  const createTrade = useCreateTrade();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleAddTrade(input: CreateTradeInput) {
    await createTrade.mutateAsync(input);
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
            onClick={() => setDialogOpen(true)}
          >
            Add trade
          </Button>
        </Box>
        <StatsPanel stats={stats} isLoading={isLoading} />
        <TradeTable trades={trades ?? []} isLoading={isLoading} />
      </Container>

      <TradeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddTrade}
        isSubmitting={createTrade.isPending}
      />
    </Box>
  );
}
