import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, Send } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import type { DocumentStatus } from "@/types/mdsign-app-router";

interface DocumentCardProps {
  doc: {
    id: number;
    name: string;
    status: string;
    createdAt: Date | string;
    signerCount: number;
    signedCount: number;
  };
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  SENT: { label: "Enviado", icon: Send, variant: "secondary" },
  PENDING: { label: "Pendente", icon: Clock, variant: "outline" },
  CONCLUDED: { label: "Concluído", icon: CheckCircle2, variant: "default" },
  REFUSED: { label: "Recusado", icon: XCircle, variant: "destructive" },
  EXPIRED: { label: "Expirado", icon: AlertCircle, variant: "destructive" },
};

export function DocumentCard({ doc }: DocumentCardProps) {
  const status = statusConfig[doc.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;
  const createdDate = new Date(doc.createdAt).toLocaleDateString("pt-BR");
  const progress = doc.signerCount > 0 ? Math.round((doc.signedCount / doc.signerCount) * 100) : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {doc.name}
              </h3>
              <p className="text-sm text-muted-foreground">{createdDate}</p>
            </div>
          </div>
          <Badge variant={status.variant} className="flex items-center gap-1">
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Assinaturas</span>
            <span className="font-medium">
              {doc.signedCount}/{doc.signerCount}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to={`/documents/${doc.id}`}>Ver detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
