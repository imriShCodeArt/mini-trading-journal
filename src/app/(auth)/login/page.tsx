"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@/components/icons";
import Link from "@/components/Link";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

const magicLinkSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

const passwordSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type MagicLinkForm = z.infer<typeof magicLinkSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

type TabValue = "magic" | "password";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabValue>("magic");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const magicForm = useForm<MagicLinkForm>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onMagicLinkSubmit(data: MagicLinkForm) {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  async function onPasswordSubmit(data: PasswordForm) {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Sign in
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setError(null);
            setSent(false);
          }}
          sx={{ mb: 2 }}
        >
          <Tab label="Magic link" value="magic" />
          <Tab label="Password" value="password" />
        </Tabs>

        {tab === "magic" ? (
          <>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Enter your email to receive a magic link. No password needed.
            </Typography>

            {sent ? (
              <Box sx={{ py: 2 }}>
                <Typography color="success.main" gutterBottom>
                  Check your email for the sign-in link.
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Click the link to sign in. You can close this tab.
                </Typography>
              </Box>
            ) : (
              <Box
                component="form"
                onSubmit={magicForm.handleSubmit(onMagicLinkSubmit)}
                noValidate
              >
                <TextField
                  {...magicForm.register("email")}
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  autoComplete="email"
                  autoFocus
                  error={!!magicForm.formState.errors.email}
                  helperText={magicForm.formState.errors.email?.message}
                  sx={{ mb: 2 }}
                />
                {error && (
                  <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={magicForm.formState.isSubmitting}
                  sx={{ py: 1.5 }}
                >
                  {magicForm.formState.isSubmitting
                    ? "Sending…"
                    : "Send magic link"}
                </Button>
              </Box>
            )}
          </>
        ) : (
          <>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Sign in with your email and password.
            </Typography>

            <Box
              component="form"
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              noValidate
            >
              <TextField
                {...passwordForm.register("email")}
                label="Email"
                type="email"
                fullWidth
                required
                autoComplete="email"
                autoFocus
                error={!!passwordForm.formState.errors.email}
                helperText={passwordForm.formState.errors.email?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                {...passwordForm.register("password")}
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                autoComplete="current-password"
                error={!!passwordForm.formState.errors.password}
                helperText={passwordForm.formState.errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((p) => !p)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />
              <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <MuiLink
                  component={Link}
                  href="/auth/reset-password"
                  variant="body2"
                  color="primary"
                  underline="hover"
                >
                  Forgot password?
                </MuiLink>
              </Box>
              {error && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={passwordForm.formState.isSubmitting}
                sx={{ py: 1.5 }}
              >
                {passwordForm.formState.isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </Box>
          </>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Don&apos;t have an account?{" "}
            <MuiLink component={Link} href="/signup" color="primary" underline="hover">
              Sign up
            </MuiLink>
          </Typography>
          <MuiLink component={Link} href="/" underline="hover" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
            ← Back to home
          </MuiLink>
        </Box>
      </Box>
    </Container>
  );
}
