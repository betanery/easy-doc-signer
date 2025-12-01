import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://api.mdsign.com.br';

interface MDSignDocument {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  signers?: Array<{
    name: string;
    email: string;
    status: string;
  }>;
}

interface CreateDocumentParams {
  name: string;
  description?: string;
  file: File;
  signers: Array<{
    name: string;
    email: string;
  }>;
}

interface StatsResponse {
  plan: string;
  used: number;
  limit: number | null;
  isUnlimited: boolean;
}

export const useMDSignAPI = () => {
  const [loading, setLoading] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem('mdsign_token');
  };

  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const handleError = (error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    
    if (error.status === 402) {
      const errorData = error.data?.error;
      if (errorData === 'FREE_TRIAL_LIMIT_REACHED') {
        toast({
          title: 'Limite atingido',
          description: 'Você utilizou os seus 5 envios gratuitos. Faça upgrade para continuar usando o MDSign.',
          variant: 'destructive',
        });
      } else if (errorData === 'MONTHLY_LIMIT_REACHED') {
        toast({
          title: 'Limite mensal atingido',
          description: 'Limite mensal de 20 documentos atingido. Faça upgrade para continuar.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Erro',
        description: error.message || defaultMessage,
        variant: 'destructive',
      });
    }
  };

  const getStats = async (): Promise<StatsResponse | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/mdsign/stats`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw await response.json();
      }

      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, 'Erro ao buscar estatísticas');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const listDocuments = async (): Promise<MDSignDocument[]> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/mdsign/documents`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw await response.json();
      }

      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      handleError(error, 'Erro ao listar documentos');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (params: CreateDocumentParams): Promise<MDSignDocument | null> => {
    try {
      setLoading(true);

      // Primeiro, verificar limites
      const stats = await getStats();
      if (stats) {
        if (stats.plan === 'FREE_TRIAL' && stats.used >= 5) {
          toast({
            title: 'Limite atingido',
            description: 'Você já utilizou os seus 5 envios gratuitos. Escolha um plano para continuar.',
            variant: 'destructive',
          });
          return null;
        }
        if (stats.plan === 'MONTHLY' && stats.limit && stats.used >= stats.limit) {
          toast({
            title: 'Limite mensal atingido',
            description: 'Você atingiu o limite mensal. Faça upgrade para continuar.',
            variant: 'destructive',
          });
          return null;
        }
      }

      // Converter arquivo para base64
      const fileBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(params.file);
      });

      const response = await fetch(`${API_BASE_URL}/mdsign/documents`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: params.name,
          description: params.description,
          file: fileBase64,
          signers: params.signers,
        }),
      });

      if (!response.ok) {
        throw await response.json();
      }

      const data = await response.json();
      
      toast({
        title: 'Sucesso',
        description: 'Documento enviado para assinatura com sucesso!',
      });

      return data;
    } catch (error) {
      handleError(error, 'Erro ao criar documento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (documentId: string): Promise<MDSignDocument | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/mdsign/documents/${documentId}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw await response.json();
      }

      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, 'Erro ao buscar documento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getActionUrl = async (documentId: string, signerId: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/mdsign/documents/${documentId}/action-url/${signerId}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw await response.json();
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      handleError(error, 'Erro ao gerar URL de assinatura');
      return null;
    }
  };

  const downloadDocument = async (documentId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/mdsign/documents/${documentId}/download`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw await response.json();
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Sucesso',
        description: 'Documento baixado com sucesso!',
      });
    } catch (error) {
      handleError(error, 'Erro ao baixar documento');
    }
  };

  return {
    loading,
    getStats,
    listDocuments,
    createDocument,
    getDocument,
    getActionUrl,
    downloadDocument,
  };
};
