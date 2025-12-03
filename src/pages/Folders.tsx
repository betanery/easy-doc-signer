import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { FolderIcon, Construction } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/Loading";

export default function FoldersPage() {
  const { isLoading: authLoading } = useRequireAuth();

  if (authLoading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Pastas</h1>
            <p className="text-muted-foreground">Organize seus documentos em pastas</p>
          </div>

          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Em breve</p>
              <p className="text-muted-foreground">
                O recurso de pastas estará disponível em uma próxima atualização
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}