import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "@/components/Link";

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              flexGrow: 1,
            }}
          >
            Mini Trading Journal
          </Typography>
          <Button component={Link} href="/login" color="inherit">
            Sign in
          </Button>
          <Button
            component={Link}
            href="/signup"
            variant="contained"
            sx={{ ml: 1 }}
          >
            Sign up
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 64px)",
          py: 8,
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" component="h1" fontWeight={600} gutterBottom>
              Mini Trading Journal
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, fontSize: "1.125rem" }}
            >
              Track your trades, analyze performance, and refine your strategy.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                component={Link}
                href="/login"
                variant="contained"
                size="large"
              >
                Get Started
              </Button>
              <Button
                component={Link}
                href="/dashboard"
                variant="outlined"
                size="large"
              >
                View Trades
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
