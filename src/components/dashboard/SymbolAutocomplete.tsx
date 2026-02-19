"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import type { AssetType } from "@/domain/entities/trade";

export interface SymbolOption {
  symbol: string;
  name: string;
  type?: string;
}

interface SymbolAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  assetType: AssetType;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
}

export function SymbolAutocomplete({
  value,
  onChange,
  onBlur,
  assetType,
  error,
  helperText,
  disabled,
  required,
  autoFocus,
}: SymbolAutocompleteProps) {
  const [options, setOptions] = useState<SymbolOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          assetType,
        });
        const res = await fetch(`/api/symbols/search?${params}`);
        const data = await res.json();
        setOptions(data.suggestions ?? []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [assetType]
  );

  const debouncedFetch = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    },
    [fetchSuggestions]
  );

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.symbol
      }
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <li key={key} {...rest}>
            <strong>{option.symbol}</strong>
            {option.name && ` — ${option.name}`}
          </li>
        );
      }}
      inputValue={inputValue}
      onInputChange={(_, newValue) => {
        setInputValue(newValue);
        onChange(newValue);
        debouncedFetch(newValue);
      }}
      onBlur={() => {
        onBlur?.();
        const trimmed = inputValue.toUpperCase().trim();
        setInputValue(trimmed);
        onChange(trimmed);
      }}
      onChange={(_, newValue) => {
        const symbol =
          typeof newValue === "string" ? newValue : newValue?.symbol ?? "";
        setInputValue(symbol);
        onChange(symbol);
      }}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Symbol"
          error={error}
          helperText={helperText}
          required={required}
          autoFocus={autoFocus}
          placeholder="e.g. AAPL or Apple"
        />
      )}
    />
  );
}
