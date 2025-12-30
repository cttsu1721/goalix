"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch if data exists
            retry: 1, // Only 1 retry on failure
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
