import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { DocumentCard } from '@/components/DocumentCard';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye,
  Download,
  Plus,
  LayoutGrid,
  LayoutList
} from 'lucide-react';
import { trpc, isAuthenticated } from '@/lib/trpc';
import { Loading } from '@/components/Loading';
import { useRequireAuth } from '@/hooks/useAuth';

export default function DocumentsList() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useRequireAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [folderFilter, setFolderFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const hasToken = isAuthenticated();
  
  const documentsQuery = trpc.mdsign.documents.list.useQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    folderId: folderFilter !== 'all' ? Number(folderFilter) : undefined,
  } as any, { enabled: hasToken });

  const foldersQuery = trpc.mdsign.folders.list.useQuery({ parentId: null } as any, { enabled: hasToken });
  
  if (authLoading) return <Loading fullScreen />;

  const documents = (documentsQuery.data as any)?.documents || [];
  const folders = (foldersQuery.data as any)?.folders || [];

  const filteredDocuments = searchQuery
    ? documents.filter((doc: any) =>
        doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(doc.id).includes(searchQuery)
      )
    : documents;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      'SENT': { label: 'Enviado', variant: 'secondary' },
      'PENDING': { label: 'Pendente', variant: 'outline' },
      'CONCLUDED': { label: 'Concluído', variant: 'default' },
      'REFUSED': { label: 'Recusado', variant: 'destructive' },
      'EXPIRED': { label: 'Expirado', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="p-8">
          <Navbar />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Documentos</h1>
              <p className="text-muted-foreground">
                Gerencie todos os seus documentos para assinatura
              </p>
            </div>
            <Button onClick={() => navigate('/documents/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Documento
            </Button>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="SENT">Enviado</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="CONCLUDED">Concluído</SelectItem>
                    <SelectItem value="REFUSED">Recusado</SelectItem>
                    <SelectItem value="EXPIRED">Expirado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={folderFilter} onValueChange={setFolderFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Pasta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Pastas</SelectItem>
                    {folders.map((folder: any) => (
                      <SelectItem key={folder.id} value={String(folder.id)}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('table')}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de documentos */}
          {documentsQuery.isLoading ? (
            <Loading />
          ) : filteredDocuments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {documents.length === 0
                    ? 'Comece enviando seu primeiro documento para assinatura'
                    : 'Nenhum documento corresponde aos filtros aplicados'
                  }
                </p>
                {documents.length === 0 && (
                  <Button onClick={() => navigate('/documents/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Documento
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((doc: any) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signatários</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc: any) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {doc.name || `Documento #${doc.id}`}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        {doc.signedCount || 0}/{doc.signerCount || 0}
                      </TableCell>
                      <TableCell>{formatDate(doc.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
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
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
