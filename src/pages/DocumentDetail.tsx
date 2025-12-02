import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTRPCDocuments, useTRPCAuth } from "@/hooks/useTRPC";
import { ArrowLeft, Download, Clock, CheckCircle2, XCircle, Send, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";
import type { Document, DocumentStatus } from "@/lib/trpc/types";

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getById, download, generateActionUrl, sendReminder, loading } = useTRPCDocuments();
  const { fetchUser } = useTRPCAuth();
  const [document, setDocument] = useState<Document | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!id) return;

    const user = await fetchUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const data = await getById(Number(id));
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
  }, [id, getById, fetchUser, navigate, toast]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleDownload = async () => {
    if (!id) return;
    await download(Number(id));
  };

  const handleGenerateUrl = async (flowActionId: string) => {
    if (!id) return;
    const url = await generateActionUrl(Number(id), flowActionId);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleSendReminder = async (flowActionId: string) => {
    if (!id) return;
    await sendReminder(Number(id), flowActionId);
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const statusMap: Record<DocumentStatus, { label: string; className: string }> = {
      PENDING: { label: "Pendente", className: "bg-status-warning text-white" },
      IN_PROGRESS: { label: "Em Andamento", className: "bg-status-info text-white" },
      COMPLETED: { label: "Concluído", className: "bg-status-success text-white" },
      CANCELLED: { label: "Cancelado", className: "bg-status-error text-white" },
      EXPIRED: { label: "Expirado", className: "bg-muted text-muted-foreground" },
    };

    const config = statusMap[status] || { label: status, className: "bg-muted text-muted-foreground" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getSignerStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "signed":
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-status-success" />;
      case "pending":
        return <Clock className="h-5 w-5 text-status-warning" />;
      case "refused":
      case "cancelled":
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{document.name}</CardTitle>
                    <CardDescription>
                      Criado em {new Date(document.createdAt).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                  {getStatusBadge(document.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[600px] border rounded-lg flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">
                    Pré-visualização disponível após download
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Linha do Tempo</CardTitle>
                <CardDescription>
                  Status de cada signatário
                </CardDescription>
              </CardHeader>
              <CardContent>
                {document.flowActions && document.flowActions.length > 0 ? (
                  <div className="space-y-4">
                    {document.flowActions.map((action, index) => (
                      <div key={action.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {getSignerStatusIcon(action.status)}
                          {index !== document.flowActions!.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{action.signerName}</p>
                          <p className="text-sm text-muted-foreground">{action.signerEmail}</p>
                          {action.signedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Assinado em {new Date(action.signedAt).toLocaleString("pt-BR")}
                            </p>
                          )}
                          {action.status.toLowerCase() === 'pending' && (
                            <div className="flex gap-2 mt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleGenerateUrl(action.id)}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Abrir Link
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSendReminder(action.id)}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Lembrete
                              </Button>
                            </div>
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
          </div>

          {/* Sidebar */}
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

            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{document.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(document.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado:</span>
                  <span>
                    {new Date(document.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {document.expirationDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expira:</span>
                    <span>
                      {new Date(document.expirationDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signatários:</span>
                  <span>{document.flowActions?.length || 0}</span>
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
