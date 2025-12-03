import { Folder, MoreVertical, Pencil, Trash2, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { FolderListItem } from "@/types/mdsign-app-router";

interface FolderCardProps {
  folder: FolderListItem;
  onOpen: (folder: FolderListItem) => void;
  onEdit: (folder: FolderListItem) => void;
  onDelete: (folder: FolderListItem) => void;
}

const FOLDER_COLORS: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  default: "bg-primary",
};

export function FolderCard({ folder, onOpen, onEdit, onDelete }: FolderCardProps) {
  const colorClass = folder.color ? FOLDER_COLORS[folder.color] || FOLDER_COLORS.default : FOLDER_COLORS.default;

  return (
    <Card 
      className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50"
      onClick={() => onOpen(folder)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", colorClass)}>
              <Folder className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-foreground line-clamp-1">{folder.name}</h3>
              {folder.documentCount !== undefined && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <FileText className="h-3 w-3" />
                  {folder.documentCount} documento{folder.documentCount !== 1 ? "s" : ""}
                </p>
              )}
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
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(folder); }}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(folder); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
