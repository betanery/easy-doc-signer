import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trpc, getAuthToken, isAuthenticated } from "@/lib/trpc";

/**
 * Hook para proteger rotas que requerem autenticação.
 * Redireciona para /auth se não houver token válido.
 */
export function useRequireAuth() {
  const navigate = useNavigate();
  const hasToken = isAuthenticated();

  // Só executa a query se tiver token
  const meQuery = trpc.auth.me.useQuery(undefined as any, {
    enabled: hasToken,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Se não tem token, redireciona imediatamente
    if (!hasToken) {
      navigate("/auth", { replace: true });
      return;
    }

    // Se a query falhou (401), remove token e redireciona
    if (meQuery.error) {
      console.log("[useRequireAuth] Auth error, redirecting to /auth");
      navigate("/auth", { replace: true });
    }
  }, [hasToken, meQuery.error, navigate]);

  return {
    user: meQuery.data,
    isLoading: hasToken && meQuery.isLoading,
    isAuthenticated: hasToken && !!meQuery.data,
    error: meQuery.error,
  };
}

/**
 * Hook para páginas públicas (login/signup).
 * Redireciona para /dashboard se já estiver autenticado.
 */
export function useRedirectIfAuthenticated() {
  const navigate = useNavigate();
  const hasToken = isAuthenticated();

  useEffect(() => {
    if (hasToken) {
      navigate("/dashboard", { replace: true });
    }
  }, [hasToken, navigate]);

  return { hasToken };
}
