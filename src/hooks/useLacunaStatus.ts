import { trpc, isAuthenticated } from "@/lib/trpc";

export function useLacunaStatus() {
  const hasToken = isAuthenticated();

  const statusQuery = trpc.mdsign.lacunaStatus.useQuery(undefined as any, {
    enabled: hasToken,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isConfigured = statusQuery.data?.status === "ok";
  const isLoading = statusQuery.isLoading;
  const error = statusQuery.data?.message || statusQuery.error?.message;

  return {
    isConfigured,
    isLoading,
    error,
    refetch: statusQuery.refetch,
  };
}
