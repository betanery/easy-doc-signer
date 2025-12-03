"use client";

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

// Token key padronizado
export const TOKEN_KEY = "mdsign_token";

// Untyped approach - backend types not available
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
      headers() {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem(TOKEN_KEY);
        console.log("[tRPC] Token being sent:", token ? `${token.substring(0, 20)}...` : "NO TOKEN");
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

// Auth helpers
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeAuthToken = () => localStorage.removeItem(TOKEN_KEY);
