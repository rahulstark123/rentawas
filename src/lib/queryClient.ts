import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds — no refetch on re-navigation within that window
        staleTime: 60 * 1000,
        // Keep unused cache for 5 minutes before garbage collecting
        gcTime: 5 * 60 * 1000,
        // Only retry once on error
        retry: 1,
        // Don't refetch on every window focus (reduces egress significantly)
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Browser-side singleton — avoids creating a new client on every render
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a fresh client
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
