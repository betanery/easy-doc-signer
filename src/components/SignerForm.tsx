import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, Trash2, User, Mail, Shield, Hash } from "lucide-react";
import type { SignerRole, AuthType, SignatureType } from "@/types/mdsign-app-router";

export interface Signer {
  name: string;
  email: string;
  role: SignerRole;
  orderStep: number;
  authType: AuthType;
  signatureType: SignatureType;
}

interface SignerFormProps {
  signers: Signer[];
  onSignersChange: (signers: Signer[]) => void;
}

const roleOptions = [
  { value: "SIGNER", label: "Signatário" },
  { value: "APPROVER", label: "Aprovador" },
  { value: "OBSERVER", label: "Observador" },
];

const authOptions = [
  { value: "EMAIL", label: "E-mail" },
  { value: "SMS", label: "SMS" },
  { value: "EMAIL_SMS", label: "E-mail + SMS" },
  { value: "EMAIL_SELFIE", label: "E-mail + Selfie" },
];

const signatureOptions = [
  { value: "ELECTRONIC", label: "Eletrônica" },
  { value: "DIGITAL_CERT", label: "Certificado Digital" },
];

export function SignerForm({ signers, onSignersChange }: SignerFormProps) {
  const addSigner = () => {
    const newSigner: Signer = {
      name: "",
      email: "",
      role: "SIGNER",
      orderStep: signers.length + 1,
      authType: "EMAIL",
      signatureType: "ELECTRONIC",
    };
    onSignersChange([...signers, newSigner]);
  };

  const removeSigner = (index: number) => {
    const updated = signers.filter((_, i) => i !== index);
    // Reorder steps
    const reordered = updated.map((s, i) => ({ ...s, orderStep: i + 1 }));
    onSignersChange(reordered);
  };

  const updateSigner = (index: number, field: keyof Signer, value: string | number) => {
    const updated = signers.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onSignersChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Signatários</h3>
        <Button type="button" variant="outline" size="sm" onClick={addSigner}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {signers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Nenhum signatário adicionado. Clique em "Adicionar" para incluir.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {signers.map((signer, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    Signatário {signer.orderStep}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSigner(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nome
                    </Label>
                    <Input
                      value={signer.name}
                      onChange={(e) => updateSigner(index, "name", e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      E-mail
                    </Label>
                    <Input
                      type="email"
                      value={signer.email}
                      onChange={(e) => updateSigner(index, "email", e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Papel
                    </Label>
                    <Select
                      value={signer.role}
                      onValueChange={(v) => updateSigner(index, "role", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Autenticação</Label>
                    <Select
                      value={signer.authType}
                      onValueChange={(v) => updateSigner(index, "authType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {authOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Assinatura</Label>
                    <Select
                      value={signer.signatureType}
                      onValueChange={(v) => updateSigner(index, "signatureType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {signatureOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
