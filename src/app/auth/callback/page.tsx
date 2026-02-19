"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let handled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const redirectToDashboard = () => {
      if (handled) return;
      handled = true;
      router.replace("/dashboard");
      router.refresh();
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        redirectToDashboard();
      }
    });

    supabase.auth.getSession().then(({ data: { session }, error: err }) => {
      if (err) {
        setError(err.message);
        return;
      }
      if (session) {
        redirectToDashboard();
      } else if (typeof window !== "undefined" && !window.location.hash) {
        fallbackTimer = setTimeout(() => {
          if (!handled) router.replace("/login");
        }, 2000);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [router]);

  if (error) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 2 }}>
        <Typography color="error">{error}</Typography>
        <Typography
          component="a"
          href="/login"
          sx={{ color: "primary.main", textDecoration: "underline" }}
        >
          Back to login
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 2 }}>
      <CircularProgress />
      <Typography color="text.secondary">Signing you in…</Typography>
    </Box>
  );
}
