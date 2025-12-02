import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  trpc, 
  setAuthToken, 
  removeAuthToken 
} from '@/lib/trpc/client';
import type {
  SignupInput,
  LoginInput,
  AuthUser,
  Document,
  DocumentSigner,
  Folder,
  Organization,
  OrganizationUser,
  Plan,
  Stats,
} from '@/lib/trpc/types';

interface TRPCError {
  status?: number;
  data?: { error?: string; message?: string };
  message?: string;
}

export const useTRPCAuth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const handleError = useCallback((error: TRPCError, defaultMessage: string) => {
    console.error(defaultMessage, error);
    toast({
      title: 'Erro',
      description: error.data?.message || error.message || defaultMessage,
      variant: 'destructive',
    });
  }, []);

  const signup = useCallback(async (input: SignupInput): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await trpc.auth.signup(input);
      setAuthToken(response.token);
      setUser(response.user);
      toast({
        title: 'Conta criada',
        description: 'Bem-vindo ao MDSign!',
      });
      return true;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao criar conta');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const login = useCallback(async (input: LoginInput): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await trpc.auth.login(input);
      setAuthToken(response.token);
      setUser(response.user);
      toast({
        title: 'Login realizado',
        description: 'Bem-vindo de volta!',
      });
      return true;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const logout = useCallback(() => {
    removeAuthToken();
    setUser(null);
  }, []);

  const fetchUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      setLoading(true);
      const userData = await trpc.auth.me();
      setUser(userData);
      return userData;
    } catch (error) {
      removeAuthToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, user, signup, login, logout, fetchUser };
};

export const useTRPCDocuments = () => {
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error: TRPCError, defaultMessage: string) => {
    console.error(defaultMessage, error);
    
    if (error.status === 402) {
      toast({
        title: 'Limite atingido',
        description: 'Você atingiu o limite do seu plano. Faça upgrade para continuar.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Erro',
        description: error.data?.message || error.message || defaultMessage,
        variant: 'destructive',
      });
    }
  }, []);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    try {
      setLoading(true);
      const fileContent = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const response = await trpc.documents.upload({
        fileName: file.name,
        fileContent,
      });
      return response.uploadId;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao fazer upload do arquivo');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const create = useCallback(async (
    uploadId: string,
    name: string,
    signers: DocumentSigner[],
    folderId?: number,
    expirationDate?: Date
  ): Promise<Document | null> => {
    try {
      setLoading(true);
      const document = await trpc.documents.create({
        uploadId,
        name,
        signers,
        folderId,
        expirationDate,
      });
      toast({
        title: 'Documento criado',
        description: 'Documento enviado para assinatura com sucesso!',
      });
      return document;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao criar documento');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const list = useCallback(async (status?: string, folderId?: number): Promise<Document[]> => {
    try {
      setLoading(true);
      const documents = await trpc.documents.list({ status, folderId });
      return documents;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao listar documentos');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getById = useCallback(async (id: number): Promise<Document | null> => {
    try {
      setLoading(true);
      const document = await trpc.documents.getById(id);
      return document;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao buscar documento');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const generateActionUrl = useCallback(async (documentId: number, flowActionId: string): Promise<string | null> => {
    try {
      const response = await trpc.documents.generateActionUrl({ documentId, flowActionId });
      return response.url;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao gerar URL de assinatura');
      return null;
    }
  }, [handleError]);

  const sendReminder = useCallback(async (documentId: number, flowActionId: string): Promise<boolean> => {
    try {
      await trpc.documents.sendReminder({ documentId, flowActionId });
      toast({
        title: 'Lembrete enviado',
        description: 'O signatário foi notificado.',
      });
      return true;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao enviar lembrete');
      return false;
    }
  }, [handleError]);

  const download = useCallback(async (id: number): Promise<void> => {
    try {
      const response = await trpc.documents.download(id);
      window.open(response.downloadUrl, '_blank');
      toast({
        title: 'Download iniciado',
        description: 'O download do documento foi iniciado.',
      });
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao baixar documento');
    }
  }, [handleError]);

  return { loading, upload, create, list, getById, generateActionUrl, sendReminder, download };
};

export const useTRPCFolders = () => {
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error: TRPCError, defaultMessage: string) => {
    console.error(defaultMessage, error);
    toast({
      title: 'Erro',
      description: error.data?.message || error.message || defaultMessage,
      variant: 'destructive',
    });
  }, []);

  const create = useCallback(async (name: string, parentId?: number, color?: string, icon?: string): Promise<Folder | null> => {
    try {
      setLoading(true);
      const folder = await trpc.folders.create({ name, parentId, color, icon });
      toast({
        title: 'Pasta criada',
        description: 'Pasta criada com sucesso!',
      });
      return folder;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao criar pasta');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const list = useCallback(async (parentId?: number | null, includeDocumentCount?: boolean): Promise<Folder[]> => {
    try {
      setLoading(true);
      const folders = await trpc.folders.list({ parentId, includeDocumentCount });
      return folders;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao listar pastas');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const tree = useCallback(async (): Promise<Folder[]> => {
    try {
      setLoading(true);
      const folders = await trpc.folders.tree();
      return folders;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao buscar árvore de pastas');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const update = useCallback(async (id: number, data: { name?: string; parentId?: number | null; color?: string; icon?: string }): Promise<Folder | null> => {
    try {
      setLoading(true);
      const folder = await trpc.folders.update({ id, ...data });
      toast({
        title: 'Pasta atualizada',
        description: 'Pasta atualizada com sucesso!',
      });
      return folder;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao atualizar pasta');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const remove = useCallback(async (id: number, force?: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      await trpc.folders.delete({ id, force });
      toast({
        title: 'Pasta excluída',
        description: 'Pasta excluída com sucesso!',
      });
      return true;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao excluir pasta');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return { loading, create, list, tree, update, remove };
};

export const useTRPCStats = () => {
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error: TRPCError, defaultMessage: string) => {
    console.error(defaultMessage, error);
    toast({
      title: 'Erro',
      description: error.data?.message || error.message || defaultMessage,
      variant: 'destructive',
    });
  }, []);

  const getStats = useCallback(async (): Promise<Stats | null> => {
    try {
      setLoading(true);
      const stats = await trpc.stats.get();
      return stats;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao buscar estatísticas');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getPlans = useCallback(async (): Promise<Plan[]> => {
    try {
      setLoading(true);
      const plans = await trpc.plans.list();
      return plans;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao buscar planos');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const upgradePlan = useCallback(async (newPlanId: number): Promise<boolean> => {
    try {
      setLoading(true);
      await trpc.stats.upgradePlan({ newPlanId });
      toast({
        title: 'Plano atualizado',
        description: 'Seu plano foi atualizado com sucesso!',
      });
      return true;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao atualizar plano');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return { loading, getStats, getPlans, upgradePlan };
};

export const useTRPCBilling = () => {
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error: TRPCError, defaultMessage: string) => {
    console.error(defaultMessage, error);
    toast({
      title: 'Erro',
      description: error.data?.message || error.message || defaultMessage,
      variant: 'destructive',
    });
  }, []);

  const createCheckout = useCallback(async (planId: number): Promise<string | null> => {
    try {
      setLoading(true);
      const response = await trpc.billing.createCheckout({ planId });
      return response.checkoutUrl;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao criar checkout');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getCustomerPortal = useCallback(async (): Promise<string | null> => {
    try {
      setLoading(true);
      const response = await trpc.billing.getCustomerPortal();
      return response.portalUrl;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao acessar portal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return { loading, createCheckout, getCustomerPortal };
};
