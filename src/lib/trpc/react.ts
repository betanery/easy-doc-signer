import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

// Untyped approach - backend types not available
const createUntypedTRPC = createTRPCReact as any;
export const trpc = createUntypedTRPC();

// URL do backend MDSign
const TRPC_URL = "https://mdsignapi-2n7ddbk9.manus.space/api/trpc";

export const trpcClient = (trpc as any).createClient({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      transformer: superjson, // tRPC v11: transformer goes in the link
      headers() {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem("auth_token");
        console.log("[tRPC] Token being sent:", token ? `${token.substring(0, 20)}...` : "NO TOKEN");
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

// Auth token management
export const getAuthToken = () => localStorage.getItem("auth_token");
export const setAuthToken = (token: string) => localStorage.setItem("auth_token", token);
export const removeAuthToken = () => localStorage.removeItem("auth_token");
