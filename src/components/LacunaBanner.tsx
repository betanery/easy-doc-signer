import { Link } from "react-router-dom";
import { AlertTriangle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLacunaStatus } from "@/hooks/useLacunaStatus";

export function LacunaBanner() {
  const { isConfigured, isLoading } = useLacunaStatus();

  // Don't show while loading or if configured
  if (isLoading || isConfigured) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            Configure suas credenciais da Lacuna para ativar as funcionalidades de assinatura
          </span>
        </div>
        <Link to="/settings/lacuna">
          <Button variant="secondary" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurar
          </Button>
        </Link>
      </div>
    </div>
  );
}
