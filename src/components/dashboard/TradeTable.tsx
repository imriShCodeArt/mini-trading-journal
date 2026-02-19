"use client";

import {
  Box,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { TradeWithComputed } from "@/domain/entities/trade";
import type { AssetType, TradeSide } from "@/domain/entities/trade";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPnl(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatAssetType(assetType: AssetType): string {
  return assetType.charAt(0).toUpperCase() + assetType.slice(1);
}

function formatSide(side: TradeSide): string {
  return side.charAt(0).toUpperCase() + side.slice(1);
}

interface TradeTableProps {
  trades: TradeWithComputed[];
  isLoading?: boolean;
  onEdit?: (trade: TradeWithComputed) => void;
  onDelete?: (trade: TradeWithComputed) => void;
}

export function TradeTable({
  trades,
  isLoading,
  onEdit,
  onDelete,
}: TradeTableProps) {
  if (isLoading) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Trades
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell>Side</TableCell>
                <TableCell>Entry</TableCell>
                <TableCell>Exit</TableCell>
                <TableCell align="right">Entry $</TableCell>
                <TableCell align="right">Exit $</TableCell>
                <TableCell align="right">Size</TableCell>
                <TableCell align="right">PnL</TableCell>
                <TableCell align="right">PnL %</TableCell>
                {(onEdit || onDelete) && (
                  <TableCell align="right" width={80}>
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={50} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={40} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={80} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={50} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={50} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={40} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={50} />
                  </TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell align="right">
                      <Skeleton variant="text" width={60} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (trades.length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Trades
        </Typography>
        <Paper variant="outlined" sx={{ py: 6, textAlign: "center" }}>
          <Typography color="text.secondary">
            No trades yet. Add your first trade to get started.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Trades
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Asset</TableCell>
              <TableCell>Side</TableCell>
              <TableCell>Entry</TableCell>
              <TableCell>Exit</TableCell>
              <TableCell align="right">Entry $</TableCell>
              <TableCell align="right">Exit $</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell align="right">PnL</TableCell>
              <TableCell align="right">PnL %</TableCell>
              {(onEdit || onDelete) && (
                <TableCell align="right" width={80}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{trade.symbol}</TableCell>
                <TableCell>{formatAssetType(trade.assetType)}</TableCell>
                <TableCell>{formatSide(trade.side)}</TableCell>
                <TableCell>{formatDate(trade.entryDate)}</TableCell>
                <TableCell>{formatDate(trade.exitDate)}</TableCell>
                <TableCell align="right">
                  {trade.entryPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </TableCell>
                <TableCell align="right">
                  {trade.exitPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </TableCell>
                <TableCell align="right">
                  {trade.positionSize.toLocaleString("en-US", {
                    maximumFractionDigits: 4,
                  })}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color:
                      trade.pnl > 0
                        ? "success.main"
                        : trade.pnl < 0
                          ? "error.main"
                          : "text.primary",
                    fontWeight: 500,
                  }}
                >
                  {formatPnl(trade.pnl)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color:
                      trade.pnlPercent > 0
                        ? "success.main"
                        : trade.pnlPercent < 0
                          ? "error.main"
                          : "text.primary",
                  }}
                >
                  {formatPercent(trade.pnlPercent)}
                </TableCell>
                {(onEdit || onDelete) && (
                  <TableCell align="right">
                    {onEdit && (
                      <IconButton
                        size="small"
                        onClick={() => onEdit(trade)}
                        aria-label={`Edit ${trade.symbol}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton
                        size="small"
                        onClick={() => onDelete(trade)}
                        aria-label={`Delete ${trade.symbol}`}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
