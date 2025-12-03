import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Plus, 
  Search,
  Loader2
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/Loading";
import { trpc, isAuthenticated } from "@/lib/trpc";
import { toast } from "sonner";
import { OrganizationCard } from "@/components/OrganizationCard";
import { OrganizationDialog } from "@/components/OrganizationDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { OrganizationListItem } from "@/types/mdsign-app-router";

export default function OrganizationsPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationListItem | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<OrganizationListItem | null>(null);

  const hasToken = isAuthenticated();

  // Query organizations
  const orgsQuery = trpc.mdsign.organizations.list.useQuery(
    { includeUserCount: true } as any,
    { enabled: hasToken }
  );

  // Mutations
  const createMutation = trpc.mdsign.organizations.create.useMutation({
    onSuccess: () => {
      toast.success("Empresa criada com sucesso!");
      setDialogOpen(false);
      orgsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar empresa");
    },
  });

  const updateMutation = trpc.mdsign.organizations.update.useMutation({
    onSuccess: () => {
      toast.success("Empresa atualizada com sucesso!");
      setDialogOpen(false);
      setEditingOrg(null);
      orgsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar empresa");
    },
  });

  const deleteMutation = trpc.mdsign.organizations.delete.useMutation({
    onSuccess: () => {
      toast.success("Empresa excluída com sucesso!");
      setDeletingOrg(null);
      orgsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir empresa");
    },
  });

  if (authLoading) {
    return <Loading />;
  }

  const organizations = (orgsQuery.data as any)?.organizations || [];
  
  const filteredOrgs = searchQuery
    ? organizations.filter((org: OrganizationListItem) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : organizations;

  const handleCreateOrg = () => {
    setEditingOrg(null);
    setDialogOpen(true);
  };

  const handleEditOrg = (org: OrganizationListItem) => {
    setEditingOrg(org);
    setDialogOpen(true);
  };

  const handleDeleteOrg = (org: OrganizationListItem) => {
    setDeletingOrg(org);
  };

  const handleSaveOrg = (data: { name: string; lacunaOrganizationId?: string }) => {
    if (editingOrg) {
      updateMutation.mutate({
        id: editingOrg.id,
        name: data.name,
        lacunaOrganizationId: data.lacunaOrganizationId || null,
      } as any);
    } else {
      createMutation.mutate({
        name: data.name,
        lacunaOrganizationId: data.lacunaOrganizationId,
      } as any);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingOrg) {
      deleteMutation.mutate({ id: deletingOrg.id } as any);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Empresas</h1>
              <p className="text-muted-foreground">
                Gerencie suas empresas e vincule usuários
              </p>
            </div>
            <Button onClick={handleCreateOrg}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          {orgsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrgs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">
                  {searchQuery ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada"}
                </p>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Tente buscar com outros termos"
                    : "Crie sua primeira empresa para começar a organizar seus documentos"}
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateOrg}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Empresa
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrgs.map((org: OrganizationListItem) => (
                <OrganizationCard
                  key={org.id}
                  organization={org}
                  onEdit={handleEditOrg}
                  onDelete={handleDeleteOrg}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <OrganizationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        organization={editingOrg}
        onSave={handleSaveOrg}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingOrg} onOpenChange={() => setDeletingOrg(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa "{deletingOrg?.name}"?
              {deletingOrg?.userCount ? (
                <span className="block mt-2 text-destructive">
                  Esta empresa possui {deletingOrg.userCount} usuário(s) vinculado(s).
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
