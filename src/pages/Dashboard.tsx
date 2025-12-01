import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Leaf, FileText, Users, Settings, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">MDSign</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
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
            Bem-vindo ao MDSign, {user?.user_metadata?.full_name || "Usuário"}!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <FileText className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Documentos</CardTitle>
              <CardDescription>
                Gerencie e assine seus documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Usuários</CardTitle>
              <CardDescription>
                Gerencie sua equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Settings className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Personalize sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
            <CardDescription>
              Complete a configuração da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold">Configurar Tenant</h3>
                <p className="text-sm text-muted-foreground">
                  Crie ou associe-se a uma organização
                </p>
              </div>
              <Button disabled>Configurar</Button>
            </div>
            
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold">Upload de Documentos</h3>
                <p className="text-sm text-muted-foreground">
                  Envie seu primeiro documento para assinatura
                </p>
              </div>
              <Button disabled>Enviar</Button>
            </div>
            
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold">Integração Lacuna Signer</h3>
                <p className="text-sm text-muted-foreground">
                  Configure suas credenciais da API
                </p>
              </div>
              <Button disabled>Integrar</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
