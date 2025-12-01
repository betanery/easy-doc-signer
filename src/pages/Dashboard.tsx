import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentNotifications } from "@/components/DocumentNotifications";
import { useToast } from "@/hooks/use-toast";
import { FileText, Users, Settings, LogOut, Upload } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { DashboardStats } from "@/components/DashboardStats";
import { DocumentsChart } from "@/components/DocumentsChart";
import { Logo } from "@/components/Logo";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
              {user?.email}
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
            Bem-vindo ao SignDoc, {user?.user_metadata?.full_name || "Usuário"}!
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

          <Card className="group hover:shadow-premium transition-all duration-300 cursor-pointer border-secondary/20 hover:border-secondary/40 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Usuários</CardTitle>
              <CardDescription>
                Gerencie sua equipe
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button className="w-full" variant="outline" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-premium transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/40 overflow-hidden relative" onClick={() => navigate('/tenants')}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Gerenciar Tenants</CardTitle>
              <CardDescription>
                Configure organizações e usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity" asChild>
                <Link to="/tenants">Acessar</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-primary/20 shadow-elegant overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="text-xl">Próximos Passos</CardTitle>
            <CardDescription>
              Complete a configuração da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <div className="flex items-center gap-4 p-5 border rounded-xl hover:border-primary/40 transition-all group hover:shadow-md bg-card/50">
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">Configurar Tenant</h3>
                <p className="text-sm text-muted-foreground">
                  Crie ou associe-se a uma organização
                </p>
              </div>
              <Button asChild className="bg-gradient-to-r from-primary to-primary-glow">
                <Link to="/tenants">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-4 p-5 border rounded-xl hover:border-primary/40 transition-all group hover:shadow-md bg-card/50">
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">Upload de Documentos</h3>
                <p className="text-sm text-muted-foreground">
                  Envie seu primeiro documento para assinatura
                </p>
              </div>
              <Button asChild className="bg-gradient-to-r from-primary to-primary-glow">
                <Link to="/documents/upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-4 p-5 border rounded-xl opacity-60 bg-card/30">
              <div className="flex-1">
                <h3 className="font-semibold">Integração Lacuna Signer</h3>
                <p className="text-sm text-muted-foreground">
                  Configure suas credenciais da API
                </p>
              </div>
              <Button disabled variant="outline">Integrar</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
