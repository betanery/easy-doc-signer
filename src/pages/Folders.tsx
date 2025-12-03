import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Folder, Plus, Trash2, Edit2, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Loading } from "@/components/Loading";
import { toast } from "sonner";

export default function FoldersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#8B5CF6");

  const foldersQuery = trpc.mdsign.folders.list.useQuery({ includeDocumentCount: true } as any);
  const createFolder = trpc.mdsign.folders.create.useMutation({
    onSuccess: () => {
      toast.success("Pasta criada com sucesso!");
      setIsCreateOpen(false);
      setNewFolderName("");
      foldersQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar pasta");
    },
  });
  const deleteFolder = trpc.mdsign.folders.delete.useMutation({
    onSuccess: () => {
      toast.success("Pasta excluída!");
      foldersQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir pasta");
    },
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Digite o nome da pasta");
      return;
    }
    (createFolder.mutate as any)({ name: newFolderName, color: newFolderColor });
  };

  const handleDeleteFolder = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta pasta?")) {
      (deleteFolder.mutate as any)({ id });
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
              <h1 className="text-3xl font-bold">Pastas</h1>
              <p className="text-muted-foreground">Organize seus documentos em pastas</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Pasta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Pasta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome da pasta</Label>
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Ex: Contratos 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="flex gap-2">
                      {["#8B5CF6", "#F97316", "#10B981", "#3B82F6", "#EC4899"].map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full transition-transform ${
                            newFolderColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewFolderColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreateFolder} 
                    className="w-full"
                    disabled={createFolder.isPending}
                  >
                    {createFolder.isPending ? "Criando..." : "Criar Pasta"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {foldersQuery.isLoading ? (
            <Loading />
          ) : (foldersQuery.data as any)?.folders?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhuma pasta criada</p>
                <p className="text-muted-foreground mb-4">
                  Crie pastas para organizar seus documentos
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira pasta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(foldersQuery.data as any)?.folders?.map((folder: any) => (
                <Card key={folder.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: folder.color || "#8B5CF6" }}
                        >
                          <Folder className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-base">{folder.name}</CardTitle>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteFolder(folder.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{folder.documentCount || 0} documentos</span>
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
