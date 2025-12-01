import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Signer {
  name: string;
  email: string;
  identifier?: string;
}

interface CreateDocumentParams {
  fileName: string;
  fileContent: string; // base64
  signers: Signer[];
  description?: string;
}

interface LacunaDocument {
  id: string;
  name: string;
  status: string;
  signers: any[];
  [key: string]: any;
}

export const useLacunaSigner = () => {
  const [loading, setLoading] = useState(false);

  const createDocument = async (params: CreateDocumentParams): Promise<LacunaDocument | null> => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar documentos",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase.functions.invoke('lacuna-signer', {
        body: {
          action: 'create',
          ...params
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Erro ao criar documento",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Documento criado com sucesso",
        description: `O documento foi enviado para ${params.signers.length} signatário(s)`,
      });

      return data.document;
    } catch (error: any) {
      console.error('Error creating document:', error);
      toast({
        title: "Erro ao criar documento",
        description: error.message || "Ocorreu um erro ao criar o documento",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const listDocuments = async (limit = 50, offset = 0): Promise<LacunaDocument[]> => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para listar documentos",
          variant: "destructive",
        });
        return [];
      }

      const { data, error } = await supabase.functions.invoke('lacuna-signer', {
        body: {
          action: 'list',
          limit,
          offset
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Erro ao listar documentos",
          description: data.error,
          variant: "destructive",
        });
        return [];
      }

      return data.documents || [];
    } catch (error: any) {
      console.error('Error listing documents:', error);
      toast({
        title: "Erro ao listar documentos",
        description: error.message || "Ocorreu um erro ao listar os documentos",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (documentId: string): Promise<LacunaDocument | null> => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para visualizar documentos",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase.functions.invoke('lacuna-signer', {
        body: {
          action: 'get',
          documentId
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Erro ao buscar documento",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      return data.document;
    } catch (error: any) {
      console.error('Error getting document:', error);
      toast({
        title: "Erro ao buscar documento",
        description: error.message || "Ocorreu um erro ao buscar o documento",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addSigner = async (documentId: string, signer: Signer): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para adicionar signatários",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase.functions.invoke('lacuna-signer', {
        body: {
          action: 'add-signer',
          documentId,
          signer
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Erro ao adicionar signatário",
          description: data.error,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Signatário adicionado",
        description: `${signer.name} foi adicionado ao documento`,
      });

      return true;
    } catch (error: any) {
      console.error('Error adding signer:', error);
      toast({
        title: "Erro ao adicionar signatário",
        description: error.message || "Ocorreu um erro ao adicionar o signatário",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para excluir documentos",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase.functions.invoke('lacuna-signer', {
        body: {
          action: 'delete',
          documentId
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Erro ao excluir documento",
          description: data.error,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Erro ao excluir documento",
        description: error.message || "Ocorreu um erro ao excluir o documento",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createDocument,
    listDocuments,
    getDocument,
    addSigner,
    deleteDocument
  };
};
