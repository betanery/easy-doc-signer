"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc, isAuthenticated } from "@/lib/trpc";
import { useRequireAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Loading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Settings, CheckCircle, XCircle, Loader2, Key, Building } from "lucide-react";

export default function LacunaSettings() {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated: isAuth } = useRequireAuth();
  const hasToken = isAuthenticated();

  const [lacunaApiKey, setLacunaApiKey] = useState("");
  const [lacunaOrganizationId, setLacunaOrganizationId] = useState("");

  // Query para verificar status atual
  const statusQuery = trpc.mdsign.lacunaStatus.useQuery(undefined as any, {
    enabled: hasToken && isAuth,
    retry: false,
  });

  // Mutation para configurar
  const configureMutation = trpc.mdsign.configureLacuna.useMutation({
    onSuccess: () => {
      toast.success("Configuração aplicada com sucesso!");
      statusQuery.refetch();
      setLacunaApiKey("");
      setLacunaOrganizationId("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao configurar Lacuna");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lacunaApiKey.trim()) {
      toast.error("Informe a API Key da Lacuna");
      return;
    }

    configureMutation.mutate({
      lacunaApiKey: lacunaApiKey.trim(),
      lacunaOrganizationId: lacunaOrganizationId.trim() || undefined,
    } as any);
  };

  if (authLoading) {
    return <Loading />;
  }

  const isConfigured = statusQuery.data?.status === "ok";

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
                  Configure suas credenciais para ativar as funcionalidades de assinatura digital
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
                      Suas credenciais da Lacuna estão configuradas e funcionando corretamente.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Não configurado</AlertTitle>
                    <AlertDescription>
                      {statusQuery.data?.message || "Configure suas credenciais abaixo para ativar as funcionalidades de assinatura."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Configuration Form */}
            <Card>
              <CardHeader>
                <CardTitle>Credenciais da Lacuna</CardTitle>
                <CardDescription>
                  Insira suas credenciais de API da Lacuna Signer. Você pode obtê-las no painel da Lacuna.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lacunaApiKey" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      API Key *
                    </Label>
                    <Input
                      id="lacunaApiKey"
                      type="password"
                      placeholder="Sua API Key da Lacuna"
                      value={lacunaApiKey}
                      onChange={(e) => setLacunaApiKey(e.target.value)}
                      disabled={configureMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lacunaOrganizationId" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Organization ID (opcional)
                    </Label>
                    <Input
                      id="lacunaOrganizationId"
                      type="text"
                      placeholder="ID da organização na Lacuna"
                      value={lacunaOrganizationId}
                      onChange={(e) => setLacunaOrganizationId(e.target.value)}
                      disabled={configureMutation.isPending}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={configureMutation.isPending || !lacunaApiKey.trim()}
                  >
                    {configureMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Configuração"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
              <CardHeader>
                <CardTitle>Precisa de ajuda?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  1. Acesse o painel da Lacuna Signer em{" "}
                  <a href="https://signer.lacuna.software" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    signer.lacuna.software
                  </a>
                </p>
                <p>2. Vá em Configurações → API Keys</p>
                <p>3. Crie uma nova API Key ou copie uma existente</p>
                <p>4. Cole a chave no campo acima e salve</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
