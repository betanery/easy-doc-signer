import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
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
import type { OrganizationListItem } from "@/types/mdsign-app-router";

interface OrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: OrganizationListItem | null;
  onSave: (data: { name: string; lacunaOrganizationId?: string }) => void;
  isLoading?: boolean;
}

export function OrganizationDialog({
  open,
  onOpenChange,
  organization,
  onSave,
  isLoading,
}: OrganizationDialogProps) {
  const [name, setName] = useState("");
  const [lacunaOrgId, setLacunaOrgId] = useState("");

  const isEditing = !!organization;

  useEffect(() => {
    if (open) {
      if (organization) {
        setName(organization.name);
        setLacunaOrgId(organization.lacunaOrganizationId || "");
      } else {
        setName("");
        setLacunaOrgId("");
      }
    }
  }, [open, organization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      lacunaOrganizationId: lacunaOrgId.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {isEditing ? "Editar Empresa" : "Nova Empresa"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize as informações da empresa"
                : "Cadastre uma nova empresa para organizar seus documentos e usuários"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da empresa *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Minha Empresa LTDA"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lacunaOrgId">ID da Organização Lacuna (opcional)</Label>
              <Input
                id="lacunaOrgId"
                value={lacunaOrgId}
                onChange={(e) => setLacunaOrgId(e.target.value)}
                placeholder="Ex: org_12345"
              />
              <p className="text-xs text-muted-foreground">
                Se você possui um ID de organização na Lacuna, informe aqui para vincular os documentos.
              </p>
            </div>
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
