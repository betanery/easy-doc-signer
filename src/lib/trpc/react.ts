import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/types/mdsign-app-router";

export const trpc = createTRPCReact<AppRouter>();

const TRPC_URL = "https://3000-iwk771ozs8dstssh7icgq-bccb9cec.manusvm.computer/api/trpc";

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: TRPC_URL,
      headers() {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem("auth_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

// Auth token management
export const getAuthToken = () => localStorage.getItem("auth_token");
export const setAuthToken = (token: string) => localStorage.setItem("auth_token", token);
export const removeAuthToken = () => localStorage.removeItem("auth_token");
