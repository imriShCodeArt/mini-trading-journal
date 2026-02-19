"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import type { ListTradesFilters, ListTradesSort } from "@/application/ports/trades-repository";

interface FiltersBarProps {
  filters: ListTradesFilters;
  sort: ListTradesSort;
  onFiltersChange: (filters: ListTradesFilters) => void;
  onSortChange: (sort: ListTradesSort) => void;
  onClear: () => void;
}

export function FiltersBar({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onClear,
}: FiltersBarProps) {
  const hasActiveFilters =
    filters.symbol ||
    filters.assetType ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "flex-end",
        mb: 3,
      }}
    >
      <TextField
        id="filter-symbol"
        label="Symbol"
        size="small"
        value={filters.symbol ?? ""}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            symbol: e.target.value.trim() || undefined,
          })
        }
        placeholder="e.g. AAPL"
        sx={{ minWidth: 120 }}
      />

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="filter-asset-type-label">Asset Type</InputLabel>
        <Select
          id="filter-asset-type"
          labelId="filter-asset-type-label"
          value={filters.assetType ?? ""}
          label="Asset Type"
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              assetType: e.target.value || undefined,
            })
          }
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="stock">Stock</MenuItem>
          <MenuItem value="crypto">Crypto</MenuItem>
          <MenuItem value="forex">Forex</MenuItem>
          <MenuItem value="index">Index</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>

      <TextField
        id="filter-from-date"
        label="From Date"
        type="date"
        size="small"
        value={
          filters.dateFrom
            ? filters.dateFrom.toISOString().slice(0, 10)
            : ""
        }
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            dateFrom: e.target.value
              ? new Date(e.target.value + "T00:00:00")
              : undefined,
          })
        }
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 140 }}
      />

      <TextField
        id="filter-to-date"
        label="To Date"
        type="date"
        size="small"
        value={
          filters.dateTo
            ? filters.dateTo.toISOString().slice(0, 10)
            : ""
        }
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            dateTo: e.target.value
              ? new Date(e.target.value + "T23:59:59")
              : undefined,
          })
        }
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 140 }}
      />

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="filter-sort-label">Sort By</InputLabel>
        <Select
          id="filter-sort"
          labelId="filter-sort-label"
          value={`${sort.field}-${sort.order}`}
          label="Sort By"
          onChange={(e) => {
            const [field, order] = (e.target.value as string).split("-") as [
              ListTradesSort["field"],
              ListTradesSort["order"],
            ];
            onSortChange({ field, order });
          }}
        >
          <MenuItem value="exit_date-desc">Exit Date (newest)</MenuItem>
          <MenuItem value="exit_date-asc">Exit Date (oldest)</MenuItem>
          <MenuItem value="pnl-desc">PnL (highest)</MenuItem>
          <MenuItem value="pnl-asc">PnL (lowest)</MenuItem>
          <MenuItem value="entry_date-desc">Entry Date (newest)</MenuItem>
          <MenuItem value="entry_date-asc">Entry Date (oldest)</MenuItem>
        </Select>
      </FormControl>

      {(hasActiveFilters || sort.field !== "exit_date" || sort.order !== "desc") && (
        <Button size="small" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </Box>
  );
}
