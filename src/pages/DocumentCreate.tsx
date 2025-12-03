import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadBox } from "@/components/UploadBox";
import { Plus, Trash2, Upload, FileText, Loader2, AlertTriangle, Settings } from "lucide-react";
import { trpc, isAuthenticated } from "@/lib/trpc";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/Loading";
import { LacunaBanner } from "@/components/LacunaBanner";
import { useLacunaStatus } from "@/hooks/useLacunaStatus";

type SignerForm = {
  name: string;
  email: string;
  cpfCnpj: string;
  role: "SIGNER" | "APPROVER" | "OBSERVER";
  authType: "EMAIL" | "SMS" | "EMAIL_SMS" | "EMAIL_SELFIE";
  signatureType: "ELECTRONIC" | "DIGITAL_CERT";
  orderStep: number;
  rubrica: boolean;
};

export default function DocumentCreatePage() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useRequireAuth();
  const hasToken = isAuthenticated();
  const { isConfigured: lacunaConfigured, isLoading: lacunaLoading } = useLacunaStatus();

  // All useState hooks MUST be before any conditional returns
  const [fileName, setFileName] = useState("");
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [applyRubrica, setApplyRubrica] = useState(true);
  const [signers, setSigners] = useState<SignerForm[]>([
    {
      name: "",
      email: "",
      cpfCnpj: "",
      role: "SIGNER",
      authType: "EMAIL",
      signatureType: "ELECTRONIC",
      orderStep: 1,
      rubrica: true,
    },
  ]);

  const foldersQuery = trpc.mdsign.folders.list.useQuery({ parentId: null } as any, { enabled: hasToken });
  const uploadMutation = trpc.mdsign.documents.upload.useMutation();
  const createMutation = trpc.mdsign.documents.create.useMutation();
  
  if (authLoading) return <Loading fullScreen />;

  const handleFileSelect = async (file: File, base64: string) => {
    setFileName(file.name);
    
    (uploadMutation.mutate as any)(
      { fileName: file.name, contentType: file.type, fileBase64: base64 },
      {
        onSuccess: (res: any) => {
          setUploadId(res.uploadId);
          toast.success("Arquivo enviado com sucesso!");
        },
        onError: (error: any) => {
          toast.error(error.message || "Erro ao enviar arquivo");
        },
      }
    );
  };

  function updateSigner(index: number, patch: Partial<SignerForm>) {
    setSigners((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], ...patch };
      return clone;
    });
  }

  function addSigner() {
    setSigners((prev) => [
      ...prev,
      {
        name: "",
        email: "",
        cpfCnpj: "",
        role: "SIGNER",
        authType: "EMAIL",
        signatureType: "ELECTRONIC",
        orderStep: prev.length + 1,
        rubrica: true,
      },
    ]);
  }

  function removeSigner(index: number) {
    if (signers.length === 1) return;
    setSigners((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!uploadId) {
      toast.error("Envie o arquivo PDF antes de criar o documento.");
      return;
    }

    if (signers.length === 0 || !signers[0].name || !signers[0].email) {
      toast.error("Preencha ao menos um signatário com nome e e-mail.");
      return;
    }

    (createMutation.mutate as any)(
      {
        uploadId,
        name: fileName || "Documento sem título",
        signers: signers.map((s) => ({
          name: s.name,
          email: s.email,
          role: s.role,
          orderStep: s.orderStep,
          authType: s.authType,
          signatureType: s.signatureType,
        })),
        folderId: folderId ? Number(folderId) : undefined,
        expirationDate: expirationDate || undefined,
      },
      {
        onSuccess: (res: any) => {
          toast.success("Documento criado com sucesso!");
          navigate(`/documents/${res.document?.id || ""}`);
        },
        onError: (error: any) => {
          toast.error(error.message || "Erro ao criar documento");
        },
      }
    );
  }

  const folders = (foldersQuery.data as any)?.folders || [];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <LacunaBanner />
        <div className="p-8">
          <Navbar />

          <h1 className="text-2xl font-bold mb-6">Novo documento</h1>

          {/* Lacuna not configured alert */}
          {!lacunaLoading && !lacunaConfigured && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Configuração necessária</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>Configure suas credenciais da Lacuna para criar documentos.</span>
                <Link to="/settings/lacuna">
                  <Button variant="outline" size="sm" className="gap-2 ml-4">
                    <Settings className="h-4 w-4" />
                    Configurar
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1: Arquivo e configurações */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Arquivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UploadBox
                    onFileSelect={handleFileSelect}
                    isUploading={uploadMutation.isPending}
                  />
                  {uploadMutation.isPending && (
                    <p className="text-xs text-primary mt-2 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Enviando arquivo...
                    </p>
                  )}
                  {uploadId && (
                    <p className="text-xs text-status-success mt-2 flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Arquivo enviado com sucesso
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pasta</Label>
                    <Select value={folderId || "none"} onValueChange={(v) => setFolderId(v === "none" ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sem pasta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem pasta</SelectItem>
                        {folders.map((f: any) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data de expiração</Label>
                    <Input
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label>Rubrica automática</Label>
                      <p className="text-xs text-muted-foreground">
                        Aplicar rubrica em todas as páginas
                      </p>
                    </div>
                    <Switch
                      checked={applyRubrica}
                      onCheckedChange={setApplyRubrica}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={createMutation.isPending || !uploadId || !lacunaConfigured}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando para assinatura...
                  </>
                ) : (
                  "Enviar para assinatura"
                )}
              </Button>
            </div>

            {/* Coluna 2 e 3: Signatários */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Signatários e Fluxo</CardTitle>
                  <Button variant="outline" size="sm" onClick={addSigner}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {signers.map((s, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-muted/30 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Signatário {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSigner(index)}
                          disabled={signers.length === 1}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome completo</Label>
                          <Input
                            placeholder="Nome completo"
                            value={s.name}
                            onChange={(e) =>
                              updateSigner(index, { name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>E-mail</Label>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            value={s.email}
                            onChange={(e) =>
                              updateSigner(index, { email: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Papel</Label>
                          <Select
                            value={s.role}
                            onValueChange={(v) =>
                              updateSigner(index, { role: v as SignerForm["role"] })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SIGNER">Signatário</SelectItem>
                              <SelectItem value="APPROVER">Aprovador</SelectItem>
                              <SelectItem value="OBSERVER">Observador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Autenticação</Label>
                          <Select
                            value={s.authType}
                            onValueChange={(v) =>
                              updateSigner(index, {
                                authType: v as SignerForm["authType"],
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EMAIL">E-mail</SelectItem>
                              <SelectItem value="EMAIL_SMS">E-mail + SMS</SelectItem>
                              <SelectItem value="SMS">SMS</SelectItem>
                              <SelectItem value="EMAIL_SELFIE">E-mail + Selfie</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Tipo assinatura</Label>
                          <Select
                            value={s.signatureType}
                            onValueChange={(v) =>
                              updateSigner(index, {
                                signatureType: v as SignerForm["signatureType"],
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ELECTRONIC">Eletrônica</SelectItem>
                              <SelectItem value="DIGITAL_CERT">
                                Certificado Digital
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Ordem</Label>
                          <Input
                            type="number"
                            min={1}
                            value={s.orderStep}
                            onChange={(e) =>
                              updateSigner(index, {
                                orderStep: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id={`rubrica-${index}`}
                          checked={s.rubrica}
                          onCheckedChange={(checked) =>
                            updateSigner(index, { rubrica: checked })
                          }
                        />
                        <Label htmlFor={`rubrica-${index}`} className="text-sm">
                          Aplicar rubrica para este signatário
                        </Label>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
