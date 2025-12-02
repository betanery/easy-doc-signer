import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMDSignAPI } from "@/hooks/useMDSignAPI";
import { Leaf, ArrowLeft, Download, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Logo } from "@/components/Logo";

interface DocumentData {
  id: string;
  name: string;
  status: string;
  created_at?: string;
  file_url?: string;
  signers?: Array<{
    name: string;
    email: string;
    status: string;
    signed_at?: string;
  }>;
  actions?: Array<{
    action: string;
    date: string;
    user: string;
  }>;
}

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getDocument, downloadDocument, loading } = useMDSignAPI();
  const [document, setDocument] = useState<DocumentData | null>(null);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    if (!id) return;

    try {
      const data = await getDocument(id);
      if (data) {
        setDocument(data);
      } else {
        toast({
          title: "Documento não encontrado",
          description: "O documento solicitado não existe",
          variant: "destructive",
        });
        navigate("/documents");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar documento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!id) return;
    await downloadDocument(id);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      draft: { label: "Rascunho", variant: "secondary" },
      pending: { label: "Pendente", variant: "default" },
      signed: { label: "Assinado", variant: "default" },
      completed: { label: "Concluído", variant: "default" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    };

    const config = statusMap[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSignerStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <CheckCircle2 className="h-5 w-5 text-status-success" />;
      case "pending":
        return <Clock className="h-5 w-5 text-status-warning" />;
      case "refused":
        return <XCircle className="h-5 w-5 text-status-error" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur-lg">
        <div className="container flex h-20 items-center justify-between">
          <Logo size="md" />
          <Button variant="ghost" onClick={() => navigate("/documents")} className="hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Document Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{document.name}</CardTitle>
                    <CardDescription>
                      {document.created_at && `Criado em ${new Date(document.created_at).toLocaleDateString("pt-BR")}`}
                    </CardDescription>
                  </div>
                  {getStatusBadge(document.status)}
                </div>
              </CardHeader>
              <CardContent>
                {document.file_url ? (
                  <div className="w-full h-[600px] border rounded-lg overflow-hidden">
                    <iframe
                      src={document.file_url}
                      className="w-full h-full"
                      title="Visualização do Documento"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[600px] border rounded-lg flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">
                      Pré-visualização não disponível
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Ações</CardTitle>
                <CardDescription>
                  Linha do tempo de todas as ações realizadas neste documento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {document.actions && document.actions.length > 0 ? (
                  <div className="space-y-4">
                    {document.actions.map((action, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {index !== document.actions!.length - 1 && (
                            <div className="w-0.5 h-full bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{action.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {action.user} • {new Date(action.date).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma ação registrada ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Signers and Actions */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Documento
                </Button>
              </CardContent>
            </Card>

            {/* Signers Card */}
            <Card>
              <CardHeader>
                <CardTitle>Signatários</CardTitle>
                <CardDescription>
                  {document.signers?.length || 0} signatário(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {document.signers && document.signers.length > 0 ? (
                  <div className="space-y-4">
                    {document.signers.map((signer, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {getSignerStatusIcon(signer.status)}
                        <div className="flex-1">
                          <p className="font-medium">{signer.name}</p>
                          <p className="text-sm text-muted-foreground">{signer.email}</p>
                          {signer.signed_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Assinado em{" "}
                              {new Date(signer.signed_at).toLocaleString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum signatário adicionado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{document.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(document.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado:</span>
                  <span>
                    {document.created_at ? new Date(document.created_at).toLocaleDateString("pt-BR") : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentDetail;