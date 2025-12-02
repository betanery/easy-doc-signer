import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

// Workaround for tRPC v11 strict type checking without backend types
// We cast to 'any' to bypass the router type validation
const createUntypedTRPC = createTRPCReact as any;
export const trpc = createUntypedTRPC();

// URL do backend - usa variável de ambiente ou fallback para produção
const TRPC_URL = import.meta.env.VITE_API_URL || "https://mdsignapi-2n7ddbk9.manus.space/api/trpc";

export const trpcClient = (trpc as any).createClient({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      headers() {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem("auth_token");
        return {
          'Content-Type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        };
      },
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
  transformer: superjson,
});

// Auth token management
export const getAuthToken = () => localStorage.getItem("auth_token");
export const setAuthToken = (token: string) => localStorage.setItem("auth_token", token);
export const removeAuthToken = () => localStorage.removeItem("auth_token");
