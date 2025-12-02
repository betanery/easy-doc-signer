import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { initTRPC } from "@trpc/server";

// Create a dummy tRPC instance for type inference
const t = initTRPC.create({
  transformer: superjson,
});

// Define dummy procedures
const procedure = t.procedure;

// Create a router structure matching the MDSign backend
const dummyRouter = t.router({
  auth: t.router({
    login: procedure.mutation(() => ({ token: "", user: {} })),
    signup: procedure.mutation(() => ({ token: "", user: {} })),
    me: procedure.query(() => ({})),
  }),
  plans: procedure.query(() => []),
  mdsign: t.router({
    documents: t.router({
      upload: procedure.mutation(() => ({ uploadId: "" })),
      create: procedure.mutation(() => ({ document: {} })),
      list: procedure.query(() => ({ documents: [] })),
      getById: procedure.query(() => ({ document: {} })),
      generateActionUrl: procedure.mutation(() => ({ url: "" })),
      sendReminder: procedure.mutation(() => ({})),
      download: procedure.query(() => ({ url: "" })),
    }),
    folders: t.router({
      create: procedure.mutation(() => ({ folder: {} })),
      list: procedure.query(() => ({ folders: [] })),
      getById: procedure.query(() => ({ folder: {} })),
      tree: procedure.query(() => ({ tree: [] })),
      update: procedure.mutation(() => ({ folder: {} })),
      delete: procedure.mutation(() => ({})),
    }),
    organizations: t.router({
      create: procedure.mutation(() => ({ organization: {} })),
      list: procedure.query(() => ({ organizations: [] })),
      getById: procedure.query(() => ({ organization: {} })),
      update: procedure.mutation(() => ({ organization: {} })),
      delete: procedure.mutation(() => ({})),
      addUser: procedure.mutation(() => ({})),
      removeUser: procedure.mutation(() => ({})),
      users: procedure.query(() => ({ users: [] })),
    }),
    stats: procedure.query(() => ({ documents: 0, pending: 0, completed: 0 })),
    upgradePlan: procedure.mutation(() => ({})),
    configureLacuna: procedure.mutation(() => ({})),
    lacunaStatus: procedure.query(() => ({})),
    removeLacunaCredentials: procedure.mutation(() => ({})),
  }),
  billing: t.router({
    createCustomer: procedure.mutation(() => ({})),
    createCheckout: procedure.mutation(() => ({ url: "" })),
    getCustomerPortal: procedure.query(() => ({ url: "" })),
  }),
});

export type AppRouter = typeof dummyRouter;

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