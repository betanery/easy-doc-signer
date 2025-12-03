import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Folder, 
  Building2, 
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderTree as FolderTreeIcon
} from "lucide-react";
import { removeAuthToken } from "@/lib/trpc";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FolderTree } from "./FolderTree";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/folders", label: "Gerenciar Pastas", icon: Folder },
  { href: "/organizations", label: "Empresas", icon: Building2 },
  { href: "/billing", label: "Planos e Cobrança", icon: CreditCard },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(true);

  const handleLogout = () => {
    removeAuthToken();
    navigate("/auth");
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-gradient-to-b from-[#6B21A8] to-[#581C87] text-white flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-purple-700/50 flex items-center justify-between">
        {!collapsed && (
          <div>
            <div className="text-xl font-bold tracking-tight">MDSign</div>
            <div className="text-[10px] text-purple-200/80">by Mundo Digital Tech</div>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-purple-700/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {/* Main Menu Items */}
        {menuItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
            (item.href === "/documents" && location.pathname.startsWith("/documents"));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-purple-900/70 text-white font-medium shadow-lg"
                  : "text-purple-100/80 hover:bg-purple-700/40 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Folder Tree Section */}
        <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-purple-100/80 hover:bg-purple-700/40 hover:text-white",
                collapsed && "justify-center"
              )}
              title={collapsed ? "Pastas Rápidas" : undefined}
            >
              <FolderTreeIcon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Pastas Rápidas</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    !foldersOpen && "-rotate-90"
                  )} />
                </>
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-accordion-down">
            <div className="mt-1 ml-2 border-l border-purple-700/50 pl-2">
              <FolderTree collapsed={collapsed} />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Remaining Menu Items */}
        {menuItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-purple-900/70 text-white font-medium shadow-lg"
                  : "text-purple-100/80 hover:bg-purple-700/40 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-4 space-y-1">
        <Link
          to="/settings/lacuna"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-purple-100/80 hover:bg-purple-700/40 hover:text-white transition-colors",
          )}
          title={collapsed ? "Configurações" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-purple-100/80 hover:bg-red-500/20 hover:text-red-200 transition-colors w-full"
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 text-[10px] text-purple-300/60 border-t border-purple-700/50">
          © {new Date().getFullYear()} Mundo Digital Tech
        </div>
      )}
    </aside>
  );
}
