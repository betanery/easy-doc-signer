import type {
  SignupInput,
  LoginInput,
  AuthResponse,
  AuthUser,
  UploadInput,
  UploadResponse,
  CreateDocumentInput,
  ListDocumentsInput,
  Document,
  CreateActionUrlInput,
  SendReminderInput,
  Plan,
  Stats,
  UpgradePlanInput,
  ConfigureLacunaInput,
  LacunaStatus,
  CreateCheckoutSessionInput,
  CheckoutResponse,
  CustomerPortalResponse,
} from './types';

const API_BASE_URL = 'https://mdsignapi-2n7ddbk9.manus.space/api/trpc';

// Get auth token from localStorage (consistent with react.ts)
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Generic fetch wrapper for tRPC-like calls
async function trpcCall<TInput, TOutput>(
  procedure: string,
  type: 'query' | 'mutation',
  input?: TInput
): Promise<TOutput> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let url = `${API_BASE_URL}/${procedure}`;
  let options: RequestInit = {
    headers,
  };

  if (type === 'query') {
    if (input) {
      url += `?input=${encodeURIComponent(JSON.stringify(input))}`;
    }
    options.method = 'GET';
  } else {
    options.method = 'POST';
    if (input) {
      options.body = JSON.stringify(input);
    }
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  const data = await response.json();
  return data.result?.data ?? data;
}

// Auth procedures
export const trpcAuth = {
  signup: (input: SignupInput) => 
    trpcCall<SignupInput, AuthResponse>('auth.signup', 'mutation', input),
  
  login: (input: LoginInput) => 
    trpcCall<LoginInput, AuthResponse>('auth.login', 'mutation', input),
  
  me: () => 
    trpcCall<void, AuthUser>('auth.me', 'query'),
};

// Document procedures - CORRECTED route names
export const trpcDocuments = {
  upload: (input: UploadInput) =>
    trpcCall<UploadInput, UploadResponse>('mdsign.documents.upload', 'mutation', input),
  
  create: (input: CreateDocumentInput) =>
    trpcCall<CreateDocumentInput, Document>('mdsign.documents.create', 'mutation', input),
  
  list: (input?: ListDocumentsInput) =>
    trpcCall<ListDocumentsInput | undefined, Document[]>('mdsign.documents.list', 'query', input),
  
  // CORRECTED: getById -> get with documentId as string
  get: (documentId: string) =>
    trpcCall<{ documentId: string }, Document>('mdsign.documents.get', 'query', { documentId }),
  
  // CORRECTED: generateActionUrl -> createActionUrl
  createActionUrl: (input: CreateActionUrlInput) =>
    trpcCall<CreateActionUrlInput, { url: string }>('mdsign.documents.createActionUrl', 'mutation', input),
  
  sendReminder: (input: SendReminderInput) =>
    trpcCall<SendReminderInput, { success: boolean }>('mdsign.documents.sendReminder', 'mutation', input),
  
  download: (documentId: string) =>
    trpcCall<{ documentId: string }, { downloadUrl: string }>('mdsign.documents.download', 'query', { documentId }),
};

// Plans procedures
export const trpcPlans = {
  list: () =>
    trpcCall<void, Plan[]>('plans', 'query'),
};

// Stats procedures
export const trpcStats = {
  get: () =>
    trpcCall<void, Stats>('mdsign.stats', 'query'),
  
  upgradePlan: (input: UpgradePlanInput) =>
    trpcCall<UpgradePlanInput, { success: boolean }>('mdsign.upgradePlan', 'mutation', input),
};

// Lacuna config procedures
export const trpcLacuna = {
  configure: (input: ConfigureLacunaInput) =>
    trpcCall<ConfigureLacunaInput, { success: boolean }>('mdsign.configureLacuna', 'mutation', input),
  
  status: () =>
    trpcCall<void, LacunaStatus>('mdsign.lacunaStatus', 'query'),
  
  removeCredentials: () =>
    trpcCall<void, { success: boolean }>('mdsign.removeLacunaCredentials', 'mutation'),
};

// Billing procedures - CORRECTED route names
export const trpcBilling = {
  // CORRECTED: createCheckout -> createCheckoutSession with planName
  createCheckoutSession: (input: CreateCheckoutSessionInput) =>
    trpcCall<CreateCheckoutSessionInput, CheckoutResponse>('billing.createCheckoutSession', 'mutation', input),
  
  // CORRECTED: getCustomerPortal -> createPortalSession
  createPortalSession: () =>
    trpcCall<void, CustomerPortalResponse>('billing.createPortalSession', 'mutation'),
};

// Export all as single object (WITHOUT folders and organizations - not available in backend)
export const trpc = {
  auth: trpcAuth,
  documents: trpcDocuments,
  plans: trpcPlans,
  stats: trpcStats,
  lacuna: trpcLacuna,
  billing: trpcBilling,
};
