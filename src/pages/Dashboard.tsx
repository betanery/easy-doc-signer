import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentNotifications } from "@/components/DocumentNotifications";
import { FileText, Users, Settings, LogOut, Upload, FolderOpen, Building2 } from "lucide-react";
import { DashboardStats } from "@/components/DashboardStats";
import { DocumentsChart } from "@/components/DocumentsChart";
import { Logo } from "@/components/Logo";
import { useTRPCAuth } from "@/hooks/useTRPC";
import type { AuthUser } from "@/lib/trpc/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const { loading, user, fetchUser, logout } = useTRPCAuth();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const userData = await fetchUser();
      if (!userData) {
        navigate("/auth");
        return;
      }
      setCurrentUser(userData);
    };
    checkAuth();
  }, [fetchUser, navigate]);

  const handleSignOut = () => {
    logout();
    navigate("/auth");
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50 shadow-elegant">
        <div className="container flex h-20 items-center justify-between">
          <Logo size="md" />
          
          <div className="flex items-center gap-4">
            <DocumentNotifications />
            <span className="text-sm text-muted-foreground hidden md:inline">
              {currentUser.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-primary/10">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao MDSign, {currentUser.name}!
          </p>
          <p className="text-sm text-muted-foreground">
            Organização: {currentUser.tenant.name} • Plano: {currentUser.tenant.plan}
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Chart */}
        <div className="mb-8">
          <DocumentsChart />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group hover:shadow-premium transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/40 overflow-hidden relative" onClick={() => navigate('/documents')}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Documentos</CardTitle>
              <CardDescription>
                Gerencie e assine seus documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity" asChild>
                <Link to="/documents">Acessar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-premium transition-all duration-300 cursor-pointer border-secondary/20 hover:border-secondary/40 overflow-hidden relative" onClick={() => navigate('/folders')}>
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FolderOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Pastas</CardTitle>
              <CardDescription>
                Organize seus documentos em pastas
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button className="w-full" variant="outline" asChild>
                <Link to="/folders">Acessar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-premium transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/40 overflow-hidden relative" onClick={() => navigate('/organizations')}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Organizações</CardTitle>
              <CardDescription>
                Gerencie suas organizações
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity" asChild>
                <Link to="/organizations">Acessar</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-primary/20 shadow-elegant overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="text-xl">Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <div className="flex items-center gap-4 p-5 border rounded-xl hover:border-primary/40 transition-all group hover:shadow-md bg-card/50">
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">Novo Documento</h3>
                <p className="text-sm text-muted-foreground">
                  Envie um documento para assinatura
                </p>
              </div>
              <Button asChild className="bg-gradient-to-r from-primary to-primary-glow">
                <Link to="/documents/upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-4 p-5 border rounded-xl hover:border-primary/40 transition-all group hover:shadow-md bg-card/50">
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">Ver Planos</h3>
                <p className="text-sm text-muted-foreground">
                  Compare e faça upgrade do seu plano
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/planos">
                  <Settings className="w-4 h-4 mr-2" />
                  Ver Planos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
