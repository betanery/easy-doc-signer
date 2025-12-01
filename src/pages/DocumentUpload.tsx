import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useLacunaSigner } from '@/hooks/useLacunaSigner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Logo } from "@/components/Logo";
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

interface Signer {
  id: string;
  name: string;
  email: string;
}

export default function DocumentUpload() {
  const navigate = useNavigate();
  const { createDocument, loading } = useLacunaSigner();
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [signers, setSigners] = useState<Signer[]>([
    { id: crypto.randomUUID(), name: '', email: '' }
  ]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos PDF",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 20MB",
          variant: "destructive",
        });
        return;
      }

      setFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  const addSigner = () => {
    setSigners([...signers, { id: crypto.randomUUID(), name: '', email: '' }]);
  };

  const removeSigner = (id: string) => {
    if (signers.length > 1) {
      setSigners(signers.filter(s => s.id !== id));
    }
  };

  const updateSigner = (id: string, field: 'name' | 'email', value: string) => {
    setSigners(signers.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix
        const base64Content = base64.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

    // Validate signers
    const validSigners = signers.filter(s => s.name && s.email);
    if (validSigners.length === 0) {
      toast({
        title: "Signatários necessários",
        description: "Adicione pelo menos um signatário válido",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
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

    try {
      const base64Content = await convertFileToBase64(file);
      
      const document = await createDocument({
        fileName: file.name,
        fileContent: base64Content,
        signers: validSigners.map(s => ({
          name: s.name,
          email: s.email,
          identifier: s.email
        })),
        description: description || undefined
      });

      if (document) {
        navigate('/documents');
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erro ao enviar documento",
        description: error.message || "Ocorreu um erro ao processar o documento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição (Opcional)</CardTitle>
              <CardDescription>
                Adicione uma descrição ou mensagem para os signatários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ex: Contrato de prestação de serviços - Por favor, revisar e assinar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
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
                <div key={signer.id} className="flex gap-4 items-start p-4 border rounded-lg">
                  <Badge variant="outline" className="mt-2">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor={`name-${signer.id}`}>Nome</Label>
                      <Input
                        id={`name-${signer.id}`}
                        placeholder="Nome completo do signatário"
                        value={signer.name}
                        onChange={(e) => updateSigner(signer.id, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`email-${signer.id}`}>E-mail</Label>
                      <Input
                        id={`email-${signer.id}`}
                        type="email"
                        placeholder="email@exemplo.com"
                        value={signer.email}
                        onChange={(e) => updateSigner(signer.id, 'email', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {signers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSigner(signer.id)}
                      className="mt-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
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
            <Button type="submit" disabled={loading || !file}>
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
