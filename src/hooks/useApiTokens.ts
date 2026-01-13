/**
 * Hook for managing MCP API tokens
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ApiToken {
  id: string;
  name: string;
  tokenPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface CreateTokenResponse {
  success: boolean;
  data: {
    id: string;
    token: string; // Plaintext token - shown once
    tokenPrefix: string;
    name: string;
    createdAt: string;
  };
}

interface ListTokensResponse {
  success: boolean;
  data: {
    tokens: ApiToken[];
  };
}

async function fetchTokens(): Promise<ApiToken[]> {
  const res = await fetch("/api/tokens");
  if (!res.ok) {
    throw new Error("Failed to fetch tokens");
  }
  const data: ListTokensResponse = await res.json();
  return data.data.tokens;
}

async function createToken(name: string): Promise<CreateTokenResponse["data"]> {
  const res = await fetch("/api/tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to create token");
  }
  const data: CreateTokenResponse = await res.json();
  return data.data;
}

async function revokeToken(id: string): Promise<void> {
  const res = await fetch(`/api/tokens/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to revoke token");
  }
}

export function useApiTokens() {
  return useQuery({
    queryKey: ["api-tokens"],
    queryFn: fetchTokens,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
  });
}

export function useRevokeToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
  });
}
