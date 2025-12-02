import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useTRPCDocuments, useTRPCStats, useTRPCFolders } from '@/hooks/useTRPC';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from "@/components/Logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  X, 
  Plus, 
  ArrowLeft, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PremiumBlockModal from '@/components/PremiumBlockModal';
import type { SignerRole, AuthType, SignatureType, Folder } from '@/lib/trpc/types';

interface Signer {
  id: string;
  name: string;
  email: string;
  role: SignerRole;
  orderStep: number;
  authType: AuthType;
  signatureType: SignatureType;
}

export default function DocumentUpload() {
  const navigate = useNavigate();
  const { upload, create, loading } = useTRPCDocuments();
  const { getStats } = useTRPCStats();
  const { list: listFolders } = useTRPCFolders();
  
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [folderId, setFolderId] = useState<number | undefined>();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [signers, setSigners] = useState<Signer[]>([
    { id: crypto.randomUUID(), name: '', email: '', role: 'SIGNER', orderStep: 1, authType: 'EMAIL', signatureType: 'ELECTRONIC' }
  ]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('FREE_TRIAL');
  const [isLimitReached, setIsLimitReached] = useState(false);

  useEffect(() => {
    const checkLimits = async () => {
      const stats = await getStats();
      if (stats) {
        setCurrentPlan(stats.plan);
        if (!stats.isUnlimited && stats.documentsLimit && stats.documentsUsed >= stats.documentsLimit) {
          setIsLimitReached(true);
          setShowPremiumModal(true);
        }
      }
    };
    checkLimits();
  }, [getStats]);

  useEffect(() => {
    const loadFolders = async () => {
      const foldersData = await listFolders();
      setFolders(foldersData);
    };
    loadFolders();
  }, [listFolders]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const droppedFile = acceptedFiles[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos PDF",
          variant: "destructive",
        });
        return;
      }

      if (droppedFile.size > 20 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 20MB",
          variant: "destructive",
        });
        return;
      }

      setFile(droppedFile);
      setDocumentName(droppedFile.name.replace('.pdf', ''));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false
  });

  const addSigner = () => {
    const newOrderStep = signers.length + 1;
    setSigners([...signers, { 
      id: crypto.randomUUID(), 
      name: '', 
      email: '', 
      role: 'SIGNER', 
      orderStep: newOrderStep,
      authType: 'EMAIL',
      signatureType: 'ELECTRONIC'
    }]);
  };

  const removeSigner = (id: string) => {
    if (signers.length > 1) {
      const filtered = signers.filter(s => s.id !== id);
      // Reorder steps
      const reordered = filtered.map((s, idx) => ({ ...s, orderStep: idx + 1 }));
      setSigners(reordered);
    }
  };

  const updateSigner = <K extends keyof Signer>(id: string, field: K, value: Signer[K]) => {
    setSigners(signers.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "Arquivo necessário",
        description: "Por favor, envie um arquivo PDF",
        variant: "destructive",
      });
      return;
    }

    const validSigners = signers.filter(s => s.name && s.email);
    if (validSigners.length === 0) {
      toast({
        title: "Signatários necessários",
        description: "Adicione pelo menos um signatário válido",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validSigners.filter(s => !emailRegex.test(s.email));
    if (invalidEmails.length > 0) {
      toast({
        title: "E-mails inválidos",
        description: "Por favor, verifique os e-mails dos signatários",
        variant: "destructive",
      });
      return;
    }

    // Step 1: Upload file
    const uploadId = await upload(file);
    if (!uploadId) return;

    // Step 2: Create document
    const document = await create(
      uploadId,
      documentName || file.name,
      validSigners.map(s => ({
        name: s.name,
        email: s.email,
        role: s.role,
        orderStep: s.orderStep,
        authType: s.authType,
        signatureType: s.signatureType,
      })),
      folderId
    );

    if (document) {
      navigate('/documents');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <PremiumBlockModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        planType={currentPlan}
      />
      <header className="border-b bg-card/80 backdrop-blur-lg shadow-elegant">
        <div className="container flex h-20 items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/documents')} className="hover:bg-primary/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="md" className="ml-4" />
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Documento PDF</CardTitle>
              <CardDescription>
                Envie o documento que precisa ser assinado (máx. 20MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary hover:bg-accent'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    {isDragActive 
                      ? 'Solte o arquivo aqui...' 
                      : 'Arraste um arquivo PDF ou clique para selecionar'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Apenas arquivos PDF são aceitos
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-accent">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFile(null);
                        setFilePreview(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {filePreview && (
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        src={filePreview}
                        className="w-full h-96"
                        title="PDF Preview"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-name">Nome do Documento</Label>
                <Input
                  id="doc-name"
                  placeholder="Ex: Contrato de Prestação de Serviços"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="folder">Pasta (Opcional)</Label>
                <Select value={folderId ? String(folderId) : ''} onValueChange={(v) => setFolderId(v ? Number(v) : undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pasta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma pasta</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={String(folder.id)}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Signers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Signatários</CardTitle>
                  <CardDescription>
                    Adicione as pessoas que precisam assinar o documento
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSigner}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {signers.map((signer, index) => (
                <div key={signer.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      Etapa {signer.orderStep}
                    </Badge>
                    {signers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSigner(signer.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        placeholder="Nome completo"
                        value={signer.name}
                        onChange={(e) => updateSigner(signer.id, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={signer.email}
                        onChange={(e) => updateSigner(signer.id, 'email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Função</Label>
                      <Select value={signer.role} onValueChange={(v) => updateSigner(signer.id, 'role', v as SignerRole)}>
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
                      <Select value={signer.authType} onValueChange={(v) => updateSigner(signer.id, 'authType', v as AuthType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMAIL">E-mail</SelectItem>
                          <SelectItem value="SMS">SMS</SelectItem>
                          <SelectItem value="EMAIL_SMS">E-mail + SMS</SelectItem>
                          <SelectItem value="EMAIL_SELFIE">E-mail + Selfie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Assinatura</Label>
                      <Select value={signer.signatureType} onValueChange={(v) => updateSigner(signer.id, 'signatureType', v as SignatureType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ELECTRONIC">Eletrônica</SelectItem>
                          <SelectItem value="DIGITAL_CERT">Com Certificado Digital</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Os signatários receberão um e-mail com o link para assinar o documento.
                  A ordem das assinaturas seguirá a ordem da lista acima.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/documents')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !file || isLimitReached} onClick={() => isLimitReached && setShowPremiumModal(true)}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Documento
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
