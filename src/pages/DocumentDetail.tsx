import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc, getAuthToken } from "@/lib/trpc";
import { ArrowLeft, Download, Clock, CheckCircle2, XCircle, Send, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // tRPC queries and mutations
  const documentQuery = trpc.mdsign.documents.get.useQuery(
    { documentId: id || '' } as any,
    { enabled: !!id }
  );
  const actionUrlMutation = trpc.mdsign.documents.createActionUrl.useMutation();
  const reminderMutation = trpc.mdsign.documents.sendReminder.useMutation();
  const downloadMutation = trpc.mdsign.documents.download.useMutation();

  useEffect(() => {
    // Check auth
    const token = getAuthToken();
    if (!token) {
      navigate('/auth');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (documentQuery.data) {
      setDocument(documentQuery.data);
      setLoading(false);
    }
    if (documentQuery.error) {
      toast.error("Documento não encontrado");
      navigate("/documents");
    }
  }, [documentQuery.data, documentQuery.error, navigate]);

  const handleDownload = async () => {
    if (!id) return;
    (downloadMutation.mutate as any)(
      { documentId: id },
      {
        onSuccess: (data: any) => {
          if (data?.downloadUrl) {
            window.open(data.downloadUrl, '_blank');
          }
        },
        onError: () => {
          toast.error("Erro ao baixar documento");
        },
      }
    );
  };

  const handleGenerateUrl = async (flowActionId: string) => {
    if (!id) return;
    (actionUrlMutation.mutate as any)(
      { documentId: id, flowActionId },
      {
        onSuccess: (data: any) => {
          if (data?.url) {
            window.open(data.url, '_blank');
          }
        },
        onError: () => {
          toast.error("Erro ao gerar URL de assinatura");
        },
      }
    );
  };

  const handleSendReminder = async (flowActionId: string) => {
    if (!id) return;
    (reminderMutation.mutate as any)(
      { documentId: id, flowActionId },
      {
        onSuccess: () => {
          toast.success("Lembrete enviado com sucesso!");
        },
        onError: () => {
          toast.error("Erro ao enviar lembrete");
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Pendente", className: "bg-status-warning text-white" },
      IN_PROGRESS: { label: "Em Andamento", className: "bg-status-info text-white" },
      COMPLETED: { label: "Concluído", className: "bg-status-success text-white" },
      CONCLUDED: { label: "Concluído", className: "bg-status-success text-white" },
      CANCELLED: { label: "Cancelado", className: "bg-status-error text-white" },
      REFUSED: { label: "Recusado", className: "bg-status-error text-white" },
      EXPIRED: { label: "Expirado", className: "bg-muted text-muted-foreground" },
    };

    const config = statusMap[status] || { label: status, className: "bg-muted text-muted-foreground" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getSignerStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
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

  if (loading || documentQuery.isLoading || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const signers = document.signers || document.flowActions || [];

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
                <CardTitle>Signatários</CardTitle>
                <CardDescription>
                  Status de cada signatário
                </CardDescription>
              </CardHeader>
              <CardContent>
                {signers.length > 0 ? (
                  <div className="space-y-4">
                    {signers.map((signer: any, index: number) => (
                      <div key={signer.id || index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {getSignerStatusIcon(signer.status)}
                          {index !== signers.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{signer.name || signer.signerName}</p>
                          <p className="text-sm text-muted-foreground">{signer.email || signer.signerEmail}</p>
                          {signer.signedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Assinado em {new Date(signer.signedAt).toLocaleString("pt-BR")}
                            </p>
                          )}
                          {signer.status?.toLowerCase() === 'pending' && (
                            <div className="flex gap-2 mt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleGenerateUrl(signer.lacunaFlowActionId || signer.id)}
                                disabled={actionUrlMutation.isPending}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Abrir Link
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSendReminder(signer.lacunaFlowActionId || signer.id)}
                                disabled={reminderMutation.isPending}
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
                  disabled={downloadMutation.isPending}
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
                  <span className="font-mono text-xs">{document.id}</span>
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
                  <span>{signers.length}</span>
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
