import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, FolderOpen, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { trpc, isAuthenticated } from "@/lib/trpc";
import { Loading } from "@/components/Loading";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";
import { Progress } from "@/components/ui/progress";
import { useRequireAuth } from "@/hooks/useAuth";
import { LacunaBanner } from "@/components/LacunaBanner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useRequireAuth();
  
  // Só busca stats se estiver autenticado
  const hasToken = isAuthenticated();
  const statsQuery = trpc.mdsign.stats.useQuery(undefined as any, {
    enabled: hasToken,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const stats = statsQuery.data as any;

  // Loading enquanto verifica auth
  if (authLoading) {
    return <Loading fullScreen />;
  }

  const usage = stats?.usage;
  const documents = stats?.documents;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <LacunaBanner />
        <div className="p-8">
          <Navbar userName={(user as any)?.name} userEmail={(user as any)?.email} />

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">
              Olá, {(user as any)?.name?.split(" ")[0] || "Usuário"}!
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao MDSign. Veja seu resumo de atividades.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Documentos</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  {documents?.total || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pendentes</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Clock className="w-6 h-6 text-status-warning" />
                  {documents?.byStatus?.PENDING || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Concluídos</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-status-success" />
                  {documents?.byStatus?.CONCLUDED || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Taxa de Conclusão</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-status-info" />
                  {stats?.statistics?.completionRate?.toFixed(0) || 0}%
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Usage Card */}
          {usage && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Uso do Plano</CardTitle>
                <CardDescription>
                  Plano {stats?.currentPlan?.displayName || stats?.currentPlan?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usage.freeTrial && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Documentos utilizados</span>
                      <span className="font-medium">
                        {usage.freeTrial.used} / {usage.freeTrial.limit}
                      </span>
                    </div>
                    <Progress
                      value={(usage.freeTrial.used / usage.freeTrial.limit) * 100}
                      className="h-3"
                    />
                    <p className="text-sm text-muted-foreground">
                      Restam {usage.freeTrial.remaining} documentos gratuitos
                    </p>
                  </div>
                )}
                {usage.monthly && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Documentos este mês ({usage.monthly.yearMonth})</span>
                      <span className="font-medium">
                        {usage.monthly.used} / {usage.monthly.limit}
                      </span>
                    </div>
                    <Progress
                      value={(usage.monthly.used / usage.monthly.limit) * 100}
                      className="h-3"
                    />
                    <p className="text-sm text-muted-foreground">
                      Restam {usage.monthly.remaining} documentos neste período
                    </p>
                  </div>
                )}
                {usage.unlimited && (
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold text-primary">
                      {usage.unlimited.totalDocuments}
                    </p>
                    <p className="text-muted-foreground">documentos criados (ilimitado)</p>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <ManageSubscriptionButton />
                  <Button variant="outline" onClick={() => navigate("/planos")}>
                    Ver planos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="group hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/documents/create')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Novo Documento</CardTitle>
                <CardDescription>
                  Envie um documento para assinatura
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/documents')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Ver Documentos</CardTitle>
                <CardDescription>
                  Acompanhe o status das assinaturas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/folders')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Pastas</CardTitle>
                <CardDescription>
                  Organize seus documentos
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
