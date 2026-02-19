"use client";

import { useEffect, useState } from "react";
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
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@/components/icons";
import Link from "@/components/Link";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

const requestResetSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

const setPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RequestResetForm = z.infer<typeof requestResetSchema>;
type SetPasswordForm = z.infer<typeof setPasswordSchema>;

type View = "request" | "sent" | "set-password";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("request");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requestForm = useForm<RequestResetForm>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  const setPasswordForm = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setView("set-password");
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setView("set-password");
      }
    });

    checkSession();
    return () => subscription.unsubscribe();
  }, []);

  async function onRequestReset(data: RequestResetForm) {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setView("sent");
  }

  async function onSetPassword(data: SetPasswordForm) {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  if (view === "sent") {
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
            Check your email
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            We&apos;ve sent you a link to reset your password. Click it to set a
            new password.
          </Typography>
          <MuiLink
            component={Link}
            href="/login"
            underline="hover"
            color="primary"
            sx={{ fontSize: "0.875rem" }}
          >
            ← Back to sign in
          </MuiLink>
        </Box>
      </Container>
    );
  }

  if (view === "set-password") {
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
            Set new password
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Enter your new password below.
          </Typography>

          <Box
            component="form"
            onSubmit={setPasswordForm.handleSubmit(onSetPassword)}
            noValidate
          >
            <TextField
              {...setPasswordForm.register("password")}
              label="New password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              autoComplete="new-password"
              autoFocus
              error={!!setPasswordForm.formState.errors.password}
              helperText={setPasswordForm.formState.errors.password?.message}
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
              sx={{ mb: 2 }}
            />
            <TextField
              {...setPasswordForm.register("confirmPassword")}
              label="Confirm new password"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              required
              autoComplete="new-password"
              error={!!setPasswordForm.formState.errors.confirmPassword}
              helperText={
                setPasswordForm.formState.errors.confirmPassword?.message
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
              disabled={setPasswordForm.formState.isSubmitting}
              sx={{ py: 1.5 }}
            >
              {setPasswordForm.formState.isSubmitting
                ? "Updating…"
                : "Update password"}
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <MuiLink
              component={Link}
              href="/login"
              underline="hover"
              color="text.secondary"
              sx={{ fontSize: "0.875rem" }}
            >
              ← Back to sign in
            </MuiLink>
          </Box>
        </Box>
      </Container>
    );
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
          Reset password
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </Typography>

        <Box
          component="form"
          onSubmit={requestForm.handleSubmit(onRequestReset)}
          noValidate
        >
          <TextField
            {...requestForm.register("email")}
            label="Email"
            type="email"
            fullWidth
            required
            autoComplete="email"
            autoFocus
            error={!!requestForm.formState.errors.email}
            helperText={requestForm.formState.errors.email?.message}
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
            disabled={requestForm.formState.isSubmitting}
            sx={{ py: 1.5 }}
          >
            {requestForm.formState.isSubmitting
              ? "Sending…"
              : "Send reset link"}
          </Button>
        </Box>

        <Box sx={{ mt: 4 }}>
          <MuiLink
            component={Link}
            href="/login"
            underline="hover"
            color="text.secondary"
            sx={{ fontSize: "0.875rem" }}
          >
            ← Back to sign in
          </MuiLink>
        </Box>
      </Box>
    </Container>
  );
}
