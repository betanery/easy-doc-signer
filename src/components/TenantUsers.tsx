import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Search } from "lucide-react";
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

interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
  role?: string;
}

interface TenantUsersProps {
  tenantId: string;
}

export const TenantUsers = ({ tenantId }: TenantUsersProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user");
  const [userToRemove, setUserToRemove] = useState<Profile | null>(null);

  useEffect(() => {
    fetchTenantAndUsers();
  }, [tenantId]);

  const fetchTenantAndUsers = async () => {
    try {
      // Fetch tenant name
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("name")
        .eq("id", tenantId)
        .single();

      if (tenantData) setTenantName(tenantData.name);

      // Fetch users in this tenant
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select("id, full_name, created_at")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .limit(1)
            .single();

          return {
            ...profile,
            role: roleData?.role,
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Digite o email do usuário",
        variant: "destructive",
      });
      return;
    }

    try {
      // Search for user profile by checking if they exist
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1000);

      if (profileError) throw profileError;

      // We need to get the auth user - try to find profile first
      // In a real scenario, you'd need a way to search by email
      // For now, we'll assume the user needs to provide the user ID
      toast({
        title: "Funcionalidade Limitada",
        description: "Por favor, forneça o ID do usuário ao invés do email. Essa funcionalidade requer acesso admin ao auth.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveUser = async () => {
    if (!userToRemove) return;

    try {
      // Remove tenant association
      const { error } = await supabase
        .from("profiles")
        .update({ tenant_id: null })
        .eq("id", userToRemove.id);

      if (error) throw error;

      toast({
        title: "Usuário removido",
        description: "O usuário foi desassociado do tenant",
      });

      setUserToRemove(null);
      fetchTenantAndUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao remover usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role || role === "user") return <Badge variant="secondary">Usuário</Badge>;
    
    return (
      <Badge variant="destructive">
        {role === "admin" ? "Admin" : "Moderador"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Usuários - {tenantName}</CardTitle>
          <CardDescription>
            Gerencie os usuários associados a este tenant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Email do usuário"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddUser()}
                />
              </div>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddUser}>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum usuário associado a este tenant
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || "Sem nome"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {user.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserToRemove(user)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!userToRemove} onOpenChange={() => setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {userToRemove?.full_name || "este usuário"} do tenant?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveUser}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};