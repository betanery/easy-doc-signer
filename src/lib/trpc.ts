"use client";

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

// Token key padronizado
export const TOKEN_KEY = "mdsign_token";

// Untyped approach - backend types not available at compile time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createUntypedTRPC = createTRPCReact as any;
export const trpc = createUntypedTRPC();

// URL do backend MDSign
const TRPC_URL = "https://mdsignapi-2n7ddbk9.manus.space/api/trpc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpcClient = (trpc as any).createClient({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      transformer: superjson,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include', // Required for CORS
        });
      },
      headers() {
        if (typeof window === "undefined") return {};

        const token = localStorage.getItem(TOKEN_KEY);

        // Corrigir problema do NO TOKEN - verificar valores inválidos
        if (!token || token === "undefined" || token === "null" || token.trim() === "") {
          console.log("[tRPC] No valid token available");
          return {};
        }

        console.log("[tRPC] Token being sent:", `${token.substring(0, 20)}...`);
        return {
          Authorization: `Bearer ${token}`,
        };
      },
    }),
  ],
});

// Auth helpers
export const getAuthToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    return null;
  }
  return token;
};

export const setAuthToken = (token: string) => {
  if (token && token !== "undefined" && token !== "null") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};
