import { useState, useEffect } from "react";
import { Folder } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FolderListItem } from "@/types/mdsign-app-router";

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: FolderListItem | null;
  parentFolders?: FolderListItem[];
  currentParentId?: number | null;
  onSave: (data: { name: string; color: string; parentId?: number | null }) => void;
  isLoading?: boolean;
}

const COLORS = [
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "green", label: "Verde", class: "bg-green-500" },
  { value: "yellow", label: "Amarelo", class: "bg-yellow-500" },
  { value: "red", label: "Vermelho", class: "bg-red-500" },
  { value: "purple", label: "Roxo", class: "bg-purple-500" },
  { value: "pink", label: "Rosa", class: "bg-pink-500" },
  { value: "orange", label: "Laranja", class: "bg-orange-500" },
];

export function FolderDialog({
  open,
  onOpenChange,
  folder,
  parentFolders = [],
  currentParentId,
  onSave,
  isLoading,
}: FolderDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("blue");
  const [parentId, setParentId] = useState<string>("none");

  const isEditing = !!folder;

  useEffect(() => {
    if (open) {
      if (folder) {
        setName(folder.name);
        setColor(folder.color || "blue");
        setParentId(folder.parentId?.toString() || "none");
      } else {
        setName("");
        setColor("blue");
        setParentId(currentParentId?.toString() || "none");
      }
    }
  }, [open, folder, currentParentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      color,
      parentId: parentId === "none" ? null : parseInt(parentId),
    });
  };

  // Filter out current folder from parent options (can't be parent of itself)
  const availableParents = parentFolders.filter((f) => f.id !== folder?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              {isEditing ? "Editar Pasta" : "Nova Pasta"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize as informações da pasta"
                : "Crie uma nova pasta para organizar seus documentos"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da pasta</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Contratos 2024"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label>Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      c.class,
                      color === c.value
                        ? "ring-2 ring-offset-2 ring-primary"
                        : "hover:scale-110"
                    )}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {availableParents.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="parent">Pasta pai (opcional)</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pasta pai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma (raiz)</SelectItem>
                    {availableParents.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
