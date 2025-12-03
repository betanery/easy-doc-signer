import { trpc, isAuthenticated } from "@/lib/trpc";

export function useLacunaStatus() {
  const hasToken = isAuthenticated();

  const statusQuery = trpc.mdsign.lacunaStatus.useQuery(undefined as any, {
    enabled: hasToken,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Backend returns { configured: boolean, apiKeyConfigured: boolean, organizationId: string | null }
  const data = statusQuery.data as any;
  const isConfigured = data?.configured === true || data?.apiKeyConfigured === true;
  const isLoading = statusQuery.isLoading;
  const error = statusQuery.error?.message;

  return {
    isConfigured,
    isLoading,
    error,
    refetch: statusQuery.refetch,
  };
}
