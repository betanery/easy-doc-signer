import { Building2, MoreVertical, Pencil, Trash2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import type { OrganizationListItem } from "@/types/mdsign-app-router";

interface OrganizationCardProps {
  organization: OrganizationListItem;
  onEdit: (org: OrganizationListItem) => void;
  onDelete: (org: OrganizationListItem) => void;
}

export function OrganizationCard({ organization, onEdit, onDelete }: OrganizationCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/organizations/${organization.id}`);
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50"
      onClick={handleClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                {organization.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                {organization.userCount !== undefined && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {organization.userCount} usuário{organization.userCount !== 1 ? "s" : ""}
                  </div>
                )}
                {organization.lacunaOrganizationId && (
                  <Badge variant="outline" className="text-xs">
                    Lacuna ID: {organization.lacunaOrganizationId}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(organization); }}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(organization); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Criada em {new Date(organization.createdAt).toLocaleDateString("pt-BR")}
          </span>
          <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => e.stopPropagation()}>
            Ver detalhes →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
