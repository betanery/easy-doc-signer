"use client";

import { useNavigate } from "react-router-dom";
import { trpc, isAuthenticated } from "@/lib/trpc";
import { useRequireAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Loading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";

export default function LacunaSettings() {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated: isAuth } = useRequireAuth();
  const hasToken = isAuthenticated();

  // Query para verificar status atual (backend valida)
  const statusQuery = trpc.mdsign.lacunaStatus.useQuery(undefined as any, {
    enabled: hasToken && isAuth,
    retry: false,
  });

  if (authLoading) {
    return <Loading />;
  }

  const data = statusQuery.data as any;
  const isConfigured = data?.configured === true || data?.apiKeyConfigured === true;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Configuração Lacuna</h1>
                <p className="text-muted-foreground">
                  Status da integração com assinatura digital
                </p>
              </div>
            </div>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Status da Integração
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statusQuery.isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando status...
                  </div>
                ) : isConfigured ? (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">Configurado</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-400">
                      A integração com Lacuna está ativa. Você pode criar e assinar documentos.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Não configurado</AlertTitle>
                    <AlertDescription>
                      A integração com Lacuna ainda não foi configurada para sua conta.
                      Entre em contato com o suporte para ativar.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            {!isConfigured && (
              <Card>
                <CardHeader>
                  <CardTitle>Como ativar?</CardTitle>
                  <CardDescription>
                    A configuração das credenciais da Lacuna é feita pelo administrador do sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Entre em contato com nosso suporte para solicitar a ativação da integração
                    com assinatura digital na sua conta.
                  </p>
                  <Button variant="outline" asChild>
                    <a 
                      href="https://wa.me/5561999338061" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Falar com Suporte
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Back Button */}
            <Button variant="ghost" onClick={() => navigate(-1)}>
              ← Voltar
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
