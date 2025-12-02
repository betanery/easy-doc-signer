import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { removeAuthToken } from "@/lib/trpc/react";

interface NavbarProps {
  userName?: string;
  userEmail?: string;
}

export function Navbar({ userName, userEmail }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken();
    navigate("/auth");
  };

  return (
    <header className="flex items-center justify-between mb-6 pb-4 border-b">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Plataforma de Assinatura MDSign
        </h2>
        <p className="text-xs text-muted-foreground">
          Assine documentos em segundos, com segurança e validade jurídica.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-10 w-64 bg-muted/50"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden md:inline text-sm">
                {userName || "Conta MDTech"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{userName || "Usuário"}</span>
                {userEmail && (
                  <span className="text-xs text-muted-foreground font-normal">
                    {userEmail}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/billing")}>
              Planos e Cobrança
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
