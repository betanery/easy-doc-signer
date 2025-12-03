import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FolderPlus, 
  ChevronRight, 
  Home, 
  Folder,
  FolderOpen,
  Loader2
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/Loading";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FolderCard } from "@/components/FolderCard";
import { FolderDialog } from "@/components/FolderDialog";
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
import type { FolderListItem } from "@/types/mdsign-app-router";

interface BreadcrumbItem {
  id: number | null;
  name: string;
}

export default function FoldersPage() {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([{ id: null, name: "Raiz" }]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderListItem | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<FolderListItem | null>(null);

  // Query folders for current level
  const foldersQuery = trpc.mdsign.folders.list.useQuery(
    { parentId: currentFolderId, includeDocumentCount: true } as any,
    { enabled: isAuthenticated }
  );

  // Query all folders for parent selection
  const allFoldersQuery = trpc.mdsign.folders.list.useQuery(
    { parentId: null, includeDocumentCount: false } as any,
    { enabled: isAuthenticated && dialogOpen }
  );

  // Mutations
  const createMutation = trpc.mdsign.folders.create.useMutation({
    onSuccess: () => {
      toast.success("Pasta criada com sucesso!");
      setDialogOpen(false);
      foldersQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar pasta");
    },
  });

  const updateMutation = trpc.mdsign.folders.update.useMutation({
    onSuccess: () => {
      toast.success("Pasta atualizada com sucesso!");
      setDialogOpen(false);
      setEditingFolder(null);
      foldersQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar pasta");
    },
  });

  const deleteMutation = trpc.mdsign.folders.delete.useMutation({
    onSuccess: () => {
      toast.success("Pasta excluída com sucesso!");
      setDeletingFolder(null);
      foldersQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir pasta");
    },
  });

  if (authLoading) {
    return <Loading />;
  }

  const folders = (foldersQuery.data as any)?.folders || [];
  const allFolders = (allFoldersQuery.data as any)?.folders || [];

  const handleOpenFolder = (folder: FolderListItem) => {
    setCurrentFolderId(folder.id);
    setBreadcrumb([...breadcrumb, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const item = breadcrumb[index];
    setCurrentFolderId(item.id);
    setBreadcrumb(breadcrumb.slice(0, index + 1));
  };

  const handleCreateFolder = () => {
    setEditingFolder(null);
    setDialogOpen(true);
  };

  const handleEditFolder = (folder: FolderListItem) => {
    setEditingFolder(folder);
    setDialogOpen(true);
  };

  const handleDeleteFolder = (folder: FolderListItem) => {
    setDeletingFolder(folder);
  };

  const handleSaveFolder = (data: { name: string; color: string; parentId?: number | null }) => {
    if (editingFolder) {
      updateMutation.mutate({
        id: editingFolder.id,
        name: data.name,
        color: data.color,
        parentId: data.parentId,
      } as any);
    } else {
      createMutation.mutate({
        name: data.name,
        color: data.color,
        parentId: data.parentId ?? currentFolderId ?? undefined,
      } as any);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingFolder) {
      deleteMutation.mutate({ id: deletingFolder.id } as any);
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
              <h1 className="text-3xl font-bold">Pastas</h1>
              <p className="text-muted-foreground">Organize seus documentos em pastas</p>
            </div>
            <Button onClick={handleCreateFolder}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Nova Pasta
            </Button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 mb-6 text-sm">
            {breadcrumb.map((item, index) => (
              <div key={item.id ?? "root"} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors ${
                    index === breadcrumb.length - 1 
                      ? "font-medium text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {index === 0 ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    <Folder className="h-4 w-4" />
                  )}
                  {item.name}
                </button>
              </div>
            ))}
          </div>

          {/* Content */}
          {foldersQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : folders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhuma pasta encontrada</p>
                <p className="text-muted-foreground mb-4">
                  {currentFolderId 
                    ? "Esta pasta está vazia" 
                    : "Crie sua primeira pasta para organizar seus documentos"}
                </p>
                <Button onClick={handleCreateFolder}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Criar Pasta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {folders.map((folder: FolderListItem) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onOpen={handleOpenFolder}
                  onEdit={handleEditFolder}
                  onDelete={handleDeleteFolder}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <FolderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        folder={editingFolder}
        parentFolders={allFolders}
        currentParentId={currentFolderId}
        onSave={handleSaveFolder}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingFolder} onOpenChange={() => setDeletingFolder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pasta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a pasta "{deletingFolder?.name}"?
              {deletingFolder?.documentCount ? (
                <span className="block mt-2 text-destructive">
                  Esta pasta contém {deletingFolder.documentCount} documento(s).
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
