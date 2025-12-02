import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import superjson from "superjson";

// Workaround for tRPC v11 strict type checking without backend types
// We cast to 'any' to bypass the router type validation
const createUntypedTRPC = createTRPCReact as any;
export const trpc = createUntypedTRPC();

// URL do backend - usa variável de ambiente ou fallback para produção
const TRPC_URL = import.meta.env.VITE_API_URL || "https://mdsignapi-2n7ddbk9.manus.space/api/trpc";

export const trpcClient = (trpc as any).createClient({
  transformer: superjson,
  links: [
    httpLink({
      url: TRPC_URL,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
      headers() {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem("auth_token");
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

// Auth token management
export const getAuthToken = () => localStorage.getItem("auth_token");
export const setAuthToken = (token: string) => localStorage.setItem("auth_token", token);
export const removeAuthToken = () => localStorage.removeItem("auth_token");