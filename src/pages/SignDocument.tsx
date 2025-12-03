import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { Loader2, FileSignature, AlertCircle } from "lucide-react";

export default function SignDocumentPage() {
  const { documentId, flowActionId } = useParams<{
    documentId: string;
    flowActionId: string;
  }>();

  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateUrl = trpc.mdsign.documents.generateActionUrl.useMutation();

  useEffect(() => {
    if (!documentId || !flowActionId) return;

    (generateUrl.mutate as any)(
      {
        documentId: Number(documentId),
        flowActionId: flowActionId,
      },
      {
        onSuccess: (res: any) => {
          setSignUrl(res.url || res.embedUrl || null);
        },
        onError: (err: any) => {
          setError(err.message || "Erro ao gerar URL de assinatura");
        },
      }
    );
  }, [documentId, flowActionId]);

  if (generateUrl.isPending && !signUrl) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Preparando ambiente seguro
          </h1>
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto carregamos o documento para assinatura...
          </p>
        </div>
      </div>
    );
  }

  if (error || !signUrl) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Não foi possível carregar o documento
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            {error || "Verifique se o link está correto ou se o documento ainda está disponível para assinatura."}
          </p>
          <p className="text-xs text-muted-foreground">
            Se o problema persistir, entre em contato com quem enviou o documento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="px-6 py-3 border-b bg-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center">
            <FileSignature className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Assinatura de documento
            </h1>
            <p className="text-xs text-muted-foreground">
              Ambiente seguro MDSign + Lacuna. Revise o conteúdo com atenção antes de concluir.
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          <p className="font-medium">Mundo Digital Tech</p>
          <p>Validade jurídica garantida</p>
        </div>
      </header>

      <main className="flex-1 bg-muted/30">
        <iframe
          src={signUrl}
          className="w-full h-full border-0"
          title="Assinatura de documento"
          allow="camera; microphone"
        />
      </main>
    </div>
  );
}
