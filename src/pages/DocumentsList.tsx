import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTRPCDocuments, useTRPCAuth, useTRPCFolders } from '@/hooks/useTRPC';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DocumentNotifications } from '@/components/DocumentNotifications';
import { Logo } from "@/components/Logo";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye,
  Download,
  ArrowLeft,
  Upload,
  Bell
} from 'lucide-react';
import type { Document, DocumentStatus } from '@/lib/trpc/types';

export default function DocumentsList() {
  const navigate = useNavigate();
  const { list, download, loading } = useTRPCDocuments();
  const { fetchUser } = useTRPCAuth();
  const { list: listFolders } = useTRPCFolders();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [folders, setFolders] = useState<Array<{ id: number; name: string }>>([]);

  const loadDocuments = useCallback(async () => {
    const status = statusFilter !== 'all' ? statusFilter : undefined;
    const folderId = folderFilter !== 'all' ? Number(folderFilter) : undefined;
    const docs = await list(status, folderId);
    setDocuments(docs);
  }, [list, statusFilter, folderFilter]);

  const filterDocuments = useCallback(() => {
    let filtered = [...documents];

    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(doc.id).includes(searchQuery)
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, searchQuery]);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await fetchUser();
      if (!user) {
        navigate('/auth');
        return;
      }
    };
    checkAuth();
  }, [fetchUser, navigate]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    const loadFolders = async () => {
      const foldersData = await listFolders();
      setFolders(foldersData);
    };
    loadFolders();
  }, [listFolders]);

  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const handleDownload = async (documentId: number) => {
    await download(documentId);
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
      'PENDING': { label: 'Pendente', className: 'bg-status-warning text-white' },
      'IN_PROGRESS': { label: 'Em Andamento', className: 'bg-status-info text-white' },
      'COMPLETED': { label: 'Concluído', className: 'bg-status-success text-white' },
      'CANCELLED': { label: 'Cancelado', className: 'bg-status-error text-white' },
      'EXPIRED': { label: 'Expirado', className: 'bg-muted text-muted-foreground' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur-lg shadow-elegant">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover:bg-primary/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-2">
            <DocumentNotifications />
            <Button onClick={() => navigate('/documents/upload')} className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
              <Upload className="w-4 h-4 mr-2" />
              Novo Documento
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Meus Documentos</CardTitle>
            <CardDescription>
              Gerencie todos os seus documentos para assinatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); }}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                  <SelectItem value="COMPLETED">Concluído</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  <SelectItem value="EXPIRED">Expirado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={folderFilter} onValueChange={(v) => { setFolderFilter(v); }}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar por pasta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Pastas</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={String(folder.id)}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tabela de documentos */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {documents.length === 0 
                    ? 'Comece enviando seu primeiro documento para assinatura'
                    : 'Nenhum documento corresponde aos filtros aplicados'
                  }
                </p>
                {documents.length === 0 && (
                  <Button onClick={() => navigate('/documents/upload')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar Documento
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Signatários</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            {doc.name || `Documento #${doc.id}`}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>
                          {doc.flowActions?.length || 0} signatário(s)
                        </TableCell>
                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/documents/${doc.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(doc.id)}
                              title="Baixar documento"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
