"use client";

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

interface DashboardContentProps {
  userEmail?: string;
}

export function DashboardContent({ userEmail }: DashboardContentProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component={Link} href="/dashboard" sx={{ textDecoration: "none", color: "inherit", flexGrow: 1 }}>
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
        <Typography variant="h5" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Your trades and stats will appear here. (Phase 2)
        </Typography>
      </Container>
    </Box>
  );
}
