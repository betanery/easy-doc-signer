import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { trpc, isAuthenticated } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import PremiumBlockModal from '@/components/PremiumBlockModal';
import { LacunaBanner } from '@/components/LacunaBanner';
import { useLacunaStatus } from '@/hooks/useLacunaStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  FileText,
  X,
  Plus,
  Trash2,
  Upload,
  Loader2,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/Loading';

type SignerRole = 'SIGNER' | 'APPROVER' | 'OBSERVER';
type AuthType = 'EMAIL' | 'SMS' | 'EMAIL_SMS' | 'EMAIL_SELFIE';
type SignatureType = 'ELECTRONIC' | 'DIGITAL_CERT';

interface Signer {
  name: string;
  email: string;
  role: SignerRole;
  orderStep: number;
  authType: AuthType;
  signatureType: SignatureType;
}

export default function DocumentUpload() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useRequireAuth();
  const hasToken = isAuthenticated();
  const { isConfigured: lacunaConfigured, isLoading: lacunaLoading } = useLacunaStatus();
  
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [signers, setSigners] = useState<Signer[]>([
    { name: '', email: '', role: 'SIGNER', orderStep: 1, authType: 'EMAIL', signatureType: 'ELECTRONIC' }
  ]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  // tRPC queries and mutations - só executa com token
  const statsQuery = trpc.mdsign.stats.useQuery(undefined, {
    enabled: hasToken,
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  if (authLoading) return <Loading fullScreen />;
  
  const uploadMutation = trpc.mdsign.documents.upload.useMutation({
    onError: (error: any) => {
      console.error('[Upload] Error:', error);
      toast.error(error.message || 'Erro ao fazer upload');
    },
  });
  
  const createMutation = trpc.mdsign.documents.create.useMutation({
    onSuccess: () => {
      toast.success('Documento criado com sucesso!');
      navigate('/documents');
    },
    onError: (error: any) => {
      console.error('[Create] Error:', error);
      if (error.data?.httpStatus === 402) {
        setShowPremiumModal(true);
      } else {
        toast.error(error.message || 'Erro ao criar documento');
      }
    },
  });

  const loading = uploadMutation.isPending || createMutation.isPending;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(f => f.type === 'application/pdf');
    if (pdfFile) {
      setFile(pdfFile);
      if (!documentName) {
        setDocumentName(pdfFile.name.replace('.pdf', ''));
      }
    } else {
      toast.error('Por favor, selecione um arquivo PDF');
    }
  }, [documentName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: loading,
  });

  const addSigner = () => {
    setSigners([
      ...signers,
      { 
        name: '', 
        email: '', 
        role: 'SIGNER', 
        orderStep: signers.length + 1, 
        authType: 'EMAIL', 
        signatureType: 'ELECTRONIC' 
      }
    ]);
  };

  const removeSigner = (index: number) => {
    if (signers.length > 1) {
      setSigners(signers.filter((_, i) => i !== index));
    }
  };

  const updateSigner = (index: number, field: keyof Signer, value: string | number) => {
    const updated = [...signers];
    updated[index] = { ...updated[index], [field]: value };
    setSigners(updated);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo PDF');
      return;
    }

    if (!documentName.trim()) {
      toast.error('Por favor, informe o nome do documento');
      return;
    }

    const validSigners = signers.filter(s => s.name.trim() && s.email.trim());
    if (validSigners.length === 0) {
      toast.error('Adicione pelo menos um signatário');
      return;
    }

    // Check plan limits
    const stats = statsQuery.data;
    if (stats) {
      const planName = stats.plan?.toUpperCase() || '';
      if (planName === 'CEDRO' && stats.documentsUsed >= 5) {
        setShowPremiumModal(true);
        return;
      }
      if (stats.documentsLimit && stats.documentsUsed >= stats.documentsLimit) {
        setShowPremiumModal(true);
        return;
      }
    }

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload file
      const uploadResult = await uploadMutation.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        fileBase64: base64.split(',')[1],
      });

      if (!uploadResult.uploadId) {
        toast.error('Erro ao fazer upload do arquivo');
        return;
      }

      // Create document
      await createMutation.mutateAsync({
        uploadId: uploadResult.uploadId,
        name: documentName.trim(),
        signers: validSigners.map((s, idx) => ({
          name: s.name.trim(),
          email: s.email.trim(),
          role: s.role,
          orderStep: idx + 1,
          authType: s.authType,
          signatureType: s.signatureType,
        })),
      });
    } catch (error) {
      console.error('[Submit] Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <LacunaBanner />
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Upload de Documento</h1>
              <p className="text-muted-foreground mt-1">Faça upload de um PDF e configure os signatários</p>
            </div>

            {/* Lacuna not configured alert */}
            {!lacunaLoading && !lacunaConfigured && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Configuração necessária</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>Configure suas credenciais da Lacuna para ativar o upload de documentos.</span>
                  <Link to="/settings/lacuna">
                    <Button variant="outline" size="sm" className="gap-2 ml-4">
                      <Settings className="h-4 w-4" />
                      Configurar
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Arquivo PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!file ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    {isDragActive ? (
                      <p className="text-primary">Solte o arquivo aqui...</p>
                    ) : (
                      <>
                        <p className="text-foreground font-medium">Arraste um PDF ou clique para selecionar</p>
                        <p className="text-muted-foreground text-sm mt-1">Apenas arquivos PDF são aceitos</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFile(null)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nome do Documento</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Ex: Contrato de Prestação de Serviços"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  disabled={loading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Signatários</CardTitle>
                <Button variant="outline" size="sm" onClick={addSigner} disabled={loading}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {signers.map((signer, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Signatário {index + 1}</span>
                      {signers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSigner(index)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          placeholder="Nome completo"
                          value={signer.name}
                          onChange={(e) => updateSigner(index, 'name', e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          value={signer.email}
                          onChange={(e) => updateSigner(index, 'email', e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Função</Label>
                        <Select
                          value={signer.role}
                          onValueChange={(v) => updateSigner(index, 'role', v)}
                          disabled={loading}
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
                          value={signer.authType}
                          onValueChange={(v) => updateSigner(index, 'authType', v)}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMAIL">Email</SelectItem>
                            <SelectItem value="SMS">SMS</SelectItem>
                            <SelectItem value="EMAIL_SMS">Email + SMS</SelectItem>
                            <SelectItem value="EMAIL_SELFIE">Email + Selfie</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de Assinatura</Label>
                        <Select
                          value={signer.signatureType}
                          onValueChange={(v) => updateSigner(index, 'signatureType', v)}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ELECTRONIC">Eletrônica</SelectItem>
                            <SelectItem value="DIGITAL_CERT">Certificado Digital</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/documents')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !file || !lacunaConfigured}
                className="bg-gradient-to-r from-primary to-primary-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Criar Documento
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>

      <PremiumBlockModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        planType={statsQuery.data?.plan?.toUpperCase() === 'CEDRO' ? 'FREE_TRIAL' : 'MONTHLY'}
      />
    </div>
  );
}
