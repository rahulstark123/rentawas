"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

export interface CurrencyDetails {
  symbol: string;
  code: string;
}

export function extractCurrencyDetails(rawCurrency: string = "USD ($)"): CurrencyDetails {
  if (!rawCurrency) return { symbol: "$", code: "USD" };

  if (rawCurrency.includes("INR") || rawCurrency.includes("₹")) {
    return { symbol: "₹", code: "INR" };
  }
  if (rawCurrency.includes("EUR") || rawCurrency.includes("€")) {
    return { symbol: "€", code: "EUR" };
  }
  if (rawCurrency.includes("GBP") || rawCurrency.includes("£")) {
    return { symbol: "£", code: "GBP" };
  }
  if (rawCurrency.includes("AED") || rawCurrency.includes("د.إ")) {
    return { symbol: "AED", code: "AED" };
  }
  if (rawCurrency.includes("SAR") || rawCurrency.includes("﷼")) {
    return { symbol: "SAR", code: "SAR" };
  }
  if (rawCurrency.includes("CAD")) {
    return { symbol: "CA$", code: "CAD" };
  }
  if (rawCurrency.includes("AUD")) {
    return { symbol: "A$", code: "AUD" };
  }
  if (rawCurrency.includes("JPY") || rawCurrency.includes("¥")) {
    return { symbol: "¥", code: "JPY" };
  }
  if (rawCurrency.includes("SGD")) {
    return { symbol: "S$", code: "SGD" };
  }
  if (rawCurrency.includes("CHF")) {
    return { symbol: "CHF", code: "CHF" };
  }

  // Extract from parens e.g. "HKD ($)"
  let symbol = "$";
  const match = rawCurrency.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    symbol = match[1].trim();
  }

  let code = "USD";
  const codeMatch = rawCurrency.match(/^[A-Z]{3}/);
  if (codeMatch) {
    code = codeMatch[0];
  }

  return { symbol, code };
}

export function formatCurrencyWithSymbol(amount: number | string, symbol: string = "$"): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount).replace(/[^0-9.-]/g, "")) || 0;
  const formatted = num.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  });

  if (symbol === "AED" || symbol === "SAR" || symbol === "CHF") {
    return `${formatted} ${symbol}`;
  }
  return `${symbol}${formatted}`;
}

interface CurrencyContextType {
  currency: string;
  currencySymbol: string;
  currencyCode: string;
  setCurrency: (newCurrency: string) => void;
  formatCurrency: (amount: number | string) => string;
  refetchCurrency: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD ($)",
  currencySymbol: "$",
  currencyCode: "USD",
  setCurrency: () => {},
  formatCurrency: (amount) => `$${amount}`,
  refetchCurrency: async () => {},
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>("USD ($)");
  const [{ symbol, code }, setDetails] = useState<CurrencyDetails>({ symbol: "$", code: "USD" });
  const currencyRef = useRef(currency);
  currencyRef.current = currency;

  const updateCurrency = useCallback((newCurrency: string) => {
    if (!newCurrency) return;

    let clean = newCurrency.trim();
    if (clean.includes("INR") || clean.includes("₹")) clean = "INR (₹)";
    else if (clean.includes("EUR") || clean.includes("€")) clean = "EUR (€)";
    else if (clean.includes("GBP") || clean.includes("£")) clean = "GBP (£)";
    else if (clean.includes("AED")) clean = "AED";
    else if (clean.includes("SGD")) clean = "SGD ($)";
    else if (clean.includes("USD") || clean.includes("$")) clean = "USD ($)";

    if (currencyRef.current === clean) return;

    currencyRef.current = clean;
    setCurrencyState(clean);
    setDetails(extractCurrencyDetails(clean));
    if (typeof window !== "undefined") {
      localStorage.setItem("rentawas_workspace_currency", clean);
    }
  }, []);

  const refetchCurrency = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("rentawas_workspace_currency");
        if (cached) {
          updateCurrency(cached);
          return;
        }
      }

      const { ensureActiveWorkspaceId, getActiveWorkspaceId } = await import("@/lib/workspace");
      const wid = (await ensureActiveWorkspaceId()) || getActiveWorkspaceId();
      if (!wid) return;

      const res = await fetch(`/api/workspace?wid=${encodeURIComponent(wid)}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.currency) {
          updateCurrency(json.data.currency);
        }
      }
    } catch (err) {
      console.warn("Failed to refetch workspace currency:", err);
    }
  }, [updateCurrency]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("rentawas_workspace_currency");
      if (cached) {
        updateCurrency(cached);
      } else {
        refetchCurrency();
      }
    } else {
      refetchCurrency();
    }
  }, [updateCurrency, refetchCurrency]);

  const formatCurrency = (amount: number | string) => {
    return formatCurrencyWithSymbol(amount, symbol);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencySymbol: symbol,
        currencyCode: code,
        setCurrency: updateCurrency,
        formatCurrency,
        refetchCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
