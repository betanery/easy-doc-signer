import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { trpc, setAuthToken, removeAuthToken, getAuthToken } from '@/lib/trpc';
import type {
  SignupInput,
  LoginInput,
  MeOutput,
  PlanName,
} from '@/types/mdsign-app-router';

interface TRPCError {
  status?: number;
  data?: { error?: string; message?: string };
  message?: string;
}

// ========== AUTH ==========
export const useTRPCAuth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<MeOutput | null>(null);

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
      const result = await trpc.auth.signup(input);
      if (result.token) {
        setAuthToken(result.token);
        setUser(result.user);
        toast({ title: 'Conta criada', description: 'Bem-vindo ao MDSign!' });
        return true;
      }
      return false;
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
      const result = await trpc.auth.login(input);
      if (result.token) {
        setAuthToken(result.token);
        setUser(result.user);
        toast({ title: 'Login realizado', description: 'Bem-vindo de volta!' });
        return true;
      }
      return false;
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
    window.location.href = '/auth';
  }, []);

  const fetchUser = useCallback(async (): Promise<MeOutput | null> => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        return null;
      }
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

// ========== DOCUMENTS ==========
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
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await trpc.documents.upload({
        fileName: file.name,
        fileContent: base64.split(',')[1],
        mimeType: file.type,
      });

      return result.uploadId;
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
    signers: any[],
    folderId?: number,
    expirationDate?: Date
  ): Promise<any | null> => {
    try {
      setLoading(true);
      const result = await trpc.documents.create({
        uploadId,
        name,
        signers,
        folderId,
        expirationDate,
      });
      toast({ title: 'Sucesso', description: 'Documento criado com sucesso!' });
      return result;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao criar documento');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const list = useCallback(async (status?: string, folderId?: number): Promise<any[]> => {
    try {
      setLoading(true);
      const result = await trpc.documents.list({ status, folderId });
      return result;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao listar documentos');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const get = useCallback(async (documentId: string): Promise<any | null> => {
    try {
      setLoading(true);
      const result = await trpc.documents.get(documentId);
      return result;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao buscar documento');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createActionUrl = useCallback(async (documentId: string, flowActionId: string): Promise<string | null> => {
    try {
      setLoading(true);
      const result = await trpc.documents.createActionUrl({ documentId, flowActionId });
      return result.url;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao gerar URL de assinatura');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const sendReminder = useCallback(async (documentId: string, flowActionId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await trpc.documents.sendReminder({ documentId, flowActionId });
      toast({ title: 'Sucesso', description: 'Lembrete enviado!' });
      return result.success;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao enviar lembrete');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const download = useCallback(async (documentId: string): Promise<void> => {
    try {
      setLoading(true);
      const result = await trpc.documents.download(documentId);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao baixar documento');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return { loading, upload, create, list, get, createActionUrl, sendReminder, download };
};

// ========== FOLDERS (stub - not available in backend) ==========
export const useTRPCFolders = () => {
  return {
    loading: false,
    create: async () => null,
    list: async () => [],
    tree: async () => [],
    update: async () => null,
    remove: async () => false,
  };
};

// ========== STATS ==========
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

  const getStats = useCallback(async (): Promise<any | null> => {
    try {
      setLoading(true);
      const result = await trpc.stats.get();
      return result;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao buscar estatísticas');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getPlans = useCallback(async (): Promise<any[]> => {
    try {
      setLoading(true);
      const result = await trpc.plans.list();
      return result;
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
      const result = await trpc.stats.upgradePlan({ newPlanId });
      toast({ title: 'Sucesso', description: 'Plano atualizado!' });
      return result.success;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao atualizar plano');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return { loading, getStats, getPlans, upgradePlan };
};

// ========== BILLING ==========
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

  const createCheckoutSession = useCallback(async (planName: PlanName, billingInterval: 'monthly' | 'yearly' = 'monthly'): Promise<string | null> => {
    try {
      setLoading(true);
      const result = await trpc.billing.createCheckoutSession({ planName, billingInterval });
      return result.url;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao criar sessão de checkout');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createPortalSession = useCallback(async (): Promise<string | null> => {
    try {
      setLoading(true);
      const result = await trpc.billing.createPortalSession();
      return result.url;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao criar sessão do portal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return { loading, createCheckoutSession, createPortalSession };
};
