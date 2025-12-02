import { createTRPCReact, type CreateTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { initTRPC } from "@trpc/server";

// Create a dummy router type for the client (actual types come from backend)
const t = initTRPC.create({ transformer: superjson });

// Create placeholder router structure matching the backend
const appRouter = t.router({
  auth: t.router({
    login: t.procedure.mutation(() => ({})),
    signup: t.procedure.mutation(() => ({})),
    me: t.procedure.query(() => ({})),
  }),
  plans: t.procedure.query(() => ({})),
  mdsign: t.router({
    documents: t.router({
      upload: t.procedure.mutation(() => ({})),
      create: t.procedure.mutation(() => ({})),
      list: t.procedure.query(() => ({})),
      getById: t.procedure.query(() => ({})),
      generateActionUrl: t.procedure.mutation(() => ({})),
      sendReminder: t.procedure.mutation(() => ({})),
      download: t.procedure.query(() => ({})),
    }),
    folders: t.router({
      create: t.procedure.mutation(() => ({})),
      list: t.procedure.query(() => ({})),
      getById: t.procedure.query(() => ({})),
      tree: t.procedure.query(() => ({})),
      update: t.procedure.mutation(() => ({})),
      delete: t.procedure.mutation(() => ({})),
    }),
    organizations: t.router({
      create: t.procedure.mutation(() => ({})),
      list: t.procedure.query(() => ({})),
      getById: t.procedure.query(() => ({})),
      update: t.procedure.mutation(() => ({})),
      delete: t.procedure.mutation(() => ({})),
      addUser: t.procedure.mutation(() => ({})),
      removeUser: t.procedure.mutation(() => ({})),
      users: t.procedure.query(() => ({})),
    }),
    stats: t.procedure.query(() => ({})),
    upgradePlan: t.procedure.mutation(() => ({})),
    configureLacuna: t.procedure.mutation(() => ({})),
    lacunaStatus: t.procedure.query(() => ({})),
    removeLacunaCredentials: t.procedure.mutation(() => ({})),
  }),
  billing: t.router({
    createCustomer: t.procedure.mutation(() => ({})),
    createCheckout: t.procedure.mutation(() => ({})),
    getCustomerPortal: t.procedure.query(() => ({})),
  }),
});

export type AppRouter = typeof appRouter;

export const trpc = createTRPCReact<AppRouter>();

const TRPC_URL = "https://3000-iwk771ozs8dstssh7icgq-bccb9cec.manusvm.computer/api/trpc";

export const trpcClient = trpc.createClient({
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
