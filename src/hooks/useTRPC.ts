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
  Plan,
  Stats,
  PlanName,
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

  // CORRECTED: Upload with contentType and fileBase64
  const upload = useCallback(async (file: File): Promise<string | null> => {
    try {
      setLoading(true);
      const fileBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const response = await trpc.documents.upload({
        fileName: file.name,
        contentType: file.type, // CORRECTED: Added contentType
        fileBase64, // CORRECTED: Renamed from fileContent
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

  // CORRECTED: get with documentId as string (was getById with number)
  const get = useCallback(async (documentId: string): Promise<Document | null> => {
    try {
      setLoading(true);
      const document = await trpc.documents.get(documentId);
      return document;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao buscar documento');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // CORRECTED: createActionUrl (was generateActionUrl)
  const createActionUrl = useCallback(async (documentId: string, flowActionId: string): Promise<string | null> => {
    try {
      const response = await trpc.documents.createActionUrl({ documentId, flowActionId });
      return response.url;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao gerar URL de assinatura');
      return null;
    }
  }, [handleError]);

  // CORRECTED: documentId is now string
  const sendReminder = useCallback(async (documentId: string, flowActionId: string): Promise<boolean> => {
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

  // CORRECTED: documentId is now string
  const download = useCallback(async (documentId: string): Promise<void> => {
    try {
      const response = await trpc.documents.download(documentId);
      window.open(response.downloadUrl, '_blank');
      toast({
        title: 'Download iniciado',
        description: 'O download do documento foi iniciado.',
      });
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao baixar documento');
    }
  }, [handleError]);

  return { loading, upload, create, list, get, createActionUrl, sendReminder, download };
};

// REMOVED: useTRPCFolders - Not available in backend
// Stub for backward compatibility
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

  // CORRECTED: createCheckoutSession with planName and billingInterval
  const createCheckoutSession = useCallback(async (planName: PlanName, billingInterval: 'monthly' | 'yearly' = 'monthly'): Promise<string | null> => {
    try {
      setLoading(true);
      const response = await trpc.billing.createCheckoutSession({ planName, billingInterval });
      return response.url;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao criar checkout');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // CORRECTED: createPortalSession (was getCustomerPortal)
  const createPortalSession = useCallback(async (): Promise<string | null> => {
    try {
      setLoading(true);
      const response = await trpc.billing.createPortalSession();
      return response.url;
    } catch (error) {
      handleError(error as TRPCError, 'Erro ao acessar portal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return { loading, createCheckoutSession, createPortalSession };
};
