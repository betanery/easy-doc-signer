import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Trash2, Users, Settings } from "lucide-react";
import { trpc, isAuthenticated } from "@/lib/trpc";
import { Loading } from "@/components/Loading";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useAuth";

export default function OrganizationsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const hasToken = isAuthenticated();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  const orgsQuery = trpc.mdsign.organizations.list.useQuery({ includeUserCount: true } as any, { enabled: hasToken });
  const createOrg = trpc.mdsign.organizations.create.useMutation({
    onSuccess: () => {
      toast.success("Organização criada com sucesso!");
      setIsCreateOpen(false);
      setNewOrgName("");
      orgsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar organização");
    },
  });
  const deleteOrg = trpc.mdsign.organizations.delete.useMutation({
    onSuccess: () => {
      toast.success("Organização excluída!");
      orgsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir organização");
    },
  });

  const handleCreateOrg = () => {
    if (!newOrgName.trim()) {
      toast.error("Digite o nome da organização");
      return;
    }
    (createOrg.mutate as any)({ name: newOrgName });
  };

  const handleDeleteOrg = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta organização?")) {
      (deleteOrg.mutate as any)({ id });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Organizações</h1>
              <p className="text-muted-foreground">Gerencie suas organizações e usuários</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Organização
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Organização</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome da organização</Label>
                    <Input
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="Ex: Matriz São Paulo"
                    />
                  </div>
                  <Button 
                    onClick={handleCreateOrg} 
                    className="w-full"
                    disabled={createOrg.isPending}
                  >
                    {createOrg.isPending ? "Criando..." : "Criar Organização"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(authLoading || orgsQuery.isLoading) ? (
            <Loading />
          ) : (orgsQuery.data as any)?.organizations?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhuma organização</p>
                <p className="text-muted-foreground mb-4">
                  Crie organizações para gerenciar seus usuários
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira organização
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(orgsQuery.data as any)?.organizations?.map((org: any) => (
                <Card key={org.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{org.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Users className="w-3 h-3" />
                            {org.userCount || 0} usuários
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Users className="w-4 h-4 mr-2" />
                        Usuários
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteOrg(org.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
