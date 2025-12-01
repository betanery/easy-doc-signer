import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Plus, Edit, Users, ArrowLeft } from "lucide-react";
import { TenantForm } from "@/components/TenantForm";
import { TenantUsers } from "@/components/TenantUsers";
import { Logo } from "@/components/Logo";

interface Tenant {
  id: string;
  name: string;
  cnpj: string | null;
  plan: string;
  max_users: number;
  monthly_doc_limit: number;
  docs_used_this_month: number;
  created_at: string;
}

const TenantManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [managingUsers, setManagingUsers] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetchTenants();
  }, []);

  const checkAdminAndFetchTenants = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      setIsAdmin(!!roleData);

      // Fetch tenants
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTenants(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar tenants",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSaved = () => {
    setShowCreateForm(false);
    setEditingTenant(null);
    checkAdminAndFetchTenants();
  };

  const getPlanBadge = (plan: string) => {
    const planColors: Record<string, string> = {
      cedro: "default",
      jacaranda: "secondary",
      angico: "outline",
      aroeira: "default",
      ipe: "secondary",
      mogno: "destructive",
    };

    return (
      <Badge variant={planColors[plan] as any || "default"}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (managingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <header className="border-b bg-card/80 backdrop-blur-lg">
          <div className="container flex h-20 items-center justify-between">
            <Logo size="md" />
            <Button variant="ghost" onClick={() => setManagingUsers(null)} className="hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </header>

        <main className="container py-8">
          <TenantUsers tenantId={managingUsers} />
        </main>
      </div>
    );
  }

  if (showCreateForm || editingTenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <header className="border-b bg-card/80 backdrop-blur-lg">
          <div className="container flex h-20 items-center justify-between">
            <Logo size="md" />
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateForm(false);
                setEditingTenant(null);
              }}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </header>

        <main className="container py-8">
          <TenantForm
            tenant={editingTenant}
            onSaved={handleTenantSaved}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingTenant(null);
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur-lg">
        <div className="container flex h-20 items-center justify-between">
          <Logo size="md" />
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gerenciamento de Tenants</h1>
            <p className="text-muted-foreground">
              Gerencie organizações e suas configurações
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Tenant
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tenants Cadastrados</CardTitle>
            <CardDescription>
              Lista de todas as organizações cadastradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tenants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhum tenant cadastrado
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Tenant
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Docs/Mês</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.cnpj || "-"}</TableCell>
                      <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                      <TableCell>{tenant.max_users}</TableCell>
                      <TableCell>
                        {tenant.docs_used_this_month} / {tenant.monthly_doc_limit}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTenant(tenant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setManagingUsers(tenant.id)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TenantManagement;