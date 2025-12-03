import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Building2, 
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Calendar,
  Link as LinkIcon,
  Loader2,
  Mail,
  Shield
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/Loading";
import { trpc, isAuthenticated } from "@/lib/trpc";
import { toast } from "sonner";
import { OrganizationDialog } from "@/components/OrganizationDialog";
import { OrganizationUserDialog } from "@/components/OrganizationUserDialog";
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
import type { OrganizationUser } from "@/types/mdsign-app-router";

const roleLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  OWNER: { label: "Proprietário", variant: "default" },
  ADMIN: { label: "Administrador", variant: "secondary" },
  USER: { label: "Usuário", variant: "outline" },
};

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading: authLoading } = useRequireAuth();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [removingUser, setRemovingUser] = useState<OrganizationUser | null>(null);

  const hasToken = isAuthenticated();
  const orgId = id ? parseInt(id, 10) : 0;

  // Query organization
  const orgQuery = trpc.mdsign.organizations.get.useQuery(
    { id: orgId } as any,
    { enabled: hasToken && !!orgId }
  );

  // Query users
  const usersQuery = trpc.mdsign.organizations.getUsers.useQuery(
    { organizationId: orgId } as any,
    { enabled: hasToken && !!orgId }
  );

  // Mutations
  const updateMutation = trpc.mdsign.organizations.update.useMutation({
    onSuccess: () => {
      toast.success("Empresa atualizada com sucesso!");
      setEditDialogOpen(false);
      orgQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar empresa");
    },
  });

  const addUserMutation = trpc.mdsign.organizations.addUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário adicionado com sucesso!");
      setAddUserDialogOpen(false);
      usersQuery.refetch();
      orgQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar usuário");
    },
  });

  const removeUserMutation = trpc.mdsign.organizations.removeUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário removido com sucesso!");
      setRemovingUser(null);
      usersQuery.refetch();
      orgQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover usuário");
    },
  });

  if (authLoading) {
    return <Loading />;
  }

  const organization = orgQuery.data as any;
  const users = (usersQuery.data as any)?.users || [];

  const handleSaveOrg = (data: { name: string; lacunaOrganizationId?: string }) => {
    updateMutation.mutate({
      id: orgId,
      name: data.name,
      lacunaOrganizationId: data.lacunaOrganizationId || null,
    } as any);
  };

  const handleAddUser = (userId: number) => {
    addUserMutation.mutate({
      organizationId: orgId,
      userId,
    } as any);
  };

  const handleConfirmRemoveUser = () => {
    if (removingUser) {
      removeUserMutation.mutate({
        organizationId: orgId,
        userId: removingUser.id,
      } as any);
    }
  };

  if (orgQuery.isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-8">
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Empresa não encontrada</p>
                <p className="text-muted-foreground mb-4">
                  A empresa que você está procurando não existe ou foi removida.
                </p>
                <Button onClick={() => navigate("/organizations")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Empresas
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/organizations")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{organization.name}</h1>
              <p className="text-muted-foreground">Detalhes e gerenciamento da empresa</p>
            </div>
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              Editar Empresa
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Criada em</p>
                    <p className="font-medium">
                      {new Date(organization.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários</p>
                    <p className="font-medium">{organization.userCount || 0} usuário(s)</p>
                  </div>
                </div>

                {organization.lacunaOrganizationId && (
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lacuna ID</p>
                      <p className="font-medium font-mono text-sm">
                        {organization.lacunaOrganizationId}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Users Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Usuários
                  </CardTitle>
                  <CardDescription>
                    Gerencie os usuários vinculados a esta empresa
                  </CardDescription>
                </div>
                <Button onClick={() => setAddUserDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                {usersQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Nenhum usuário vinculado a esta empresa
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Adicionado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: OrganizationUser) => {
                        const roleConfig = roleLabels[user.role] || roleLabels.USER;
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.name || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {user.email || "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={roleConfig.variant} className="flex items-center gap-1 w-fit">
                                <Shield className="h-3 w-3" />
                                {roleConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.addedAt).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setRemovingUser(user)}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <OrganizationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        organization={organization}
        onSave={handleSaveOrg}
        isLoading={updateMutation.isPending}
      />

      {/* Add User Dialog */}
      <OrganizationUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        organizationName={organization?.name || ""}
        onAdd={handleAddUser}
        isLoading={addUserMutation.isPending}
      />

      {/* Remove User Confirmation */}
      <AlertDialog open={!!removingUser} onOpenChange={() => setRemovingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{removingUser?.name || removingUser?.email}" desta empresa?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemoveUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeUserMutation.isPending}
            >
              {removeUserMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
