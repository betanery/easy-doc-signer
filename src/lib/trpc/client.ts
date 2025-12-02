import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
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
  GenerateActionUrlInput,
  SendReminderInput,
  CreateFolderInput,
  ListFoldersInput,
  UpdateFolderInput,
  DeleteFolderInput,
  Folder,
  CreateOrganizationInput,
  ListOrganizationsInput,
  UpdateOrganizationInput,
  AddUserToOrgInput,
  RemoveUserFromOrgInput,
  Organization,
  OrganizationUser,
  Plan,
  Stats,
  UpgradePlanInput,
  ConfigureLacunaInput,
  LacunaStatus,
  CreateCheckoutInput,
  CheckoutResponse,
  CustomerPortalResponse,
} from './types';

const API_BASE_URL = 'https://3000-iwk771ozs8dstssh7icgq-bccb9cec.manusvm.computer/api/trpc';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('mdsign_token');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('mdsign_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('mdsign_token');
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

// Document procedures
export const trpcDocuments = {
  upload: (input: UploadInput) =>
    trpcCall<UploadInput, UploadResponse>('mdsign.documents.upload', 'mutation', input),
  
  create: (input: CreateDocumentInput) =>
    trpcCall<CreateDocumentInput, Document>('mdsign.documents.create', 'mutation', input),
  
  list: (input?: ListDocumentsInput) =>
    trpcCall<ListDocumentsInput | undefined, Document[]>('mdsign.documents.list', 'query', input),
  
  getById: (id: number) =>
    trpcCall<{ id: number }, Document>('mdsign.documents.getById', 'query', { id }),
  
  generateActionUrl: (input: GenerateActionUrlInput) =>
    trpcCall<GenerateActionUrlInput, { url: string }>('mdsign.documents.generateActionUrl', 'mutation', input),
  
  sendReminder: (input: SendReminderInput) =>
    trpcCall<SendReminderInput, { success: boolean }>('mdsign.documents.sendReminder', 'mutation', input),
  
  download: (id: number) =>
    trpcCall<{ id: number }, { downloadUrl: string }>('mdsign.documents.download', 'query', { id }),
};

// Folder procedures
export const trpcFolders = {
  create: (input: CreateFolderInput) =>
    trpcCall<CreateFolderInput, Folder>('mdsign.folders.create', 'mutation', input),
  
  list: (input?: ListFoldersInput) =>
    trpcCall<ListFoldersInput | undefined, Folder[]>('mdsign.folders.list', 'query', input),
  
  getById: (id: number) =>
    trpcCall<{ id: number }, Folder>('mdsign.folders.getById', 'query', { id }),
  
  tree: () =>
    trpcCall<void, Folder[]>('mdsign.folders.tree', 'query'),
  
  update: (input: UpdateFolderInput) =>
    trpcCall<UpdateFolderInput, Folder>('mdsign.folders.update', 'mutation', input),
  
  delete: (input: DeleteFolderInput) =>
    trpcCall<DeleteFolderInput, { success: boolean }>('mdsign.folders.delete', 'mutation', input),
};

// Organization procedures
export const trpcOrganizations = {
  create: (input: CreateOrganizationInput) =>
    trpcCall<CreateOrganizationInput, Organization>('mdsign.organizations.create', 'mutation', input),
  
  list: (input?: ListOrganizationsInput) =>
    trpcCall<ListOrganizationsInput | undefined, Organization[]>('mdsign.organizations.list', 'query', input),
  
  getById: (id: number) =>
    trpcCall<{ id: number }, Organization>('mdsign.organizations.getById', 'query', { id }),
  
  update: (input: UpdateOrganizationInput) =>
    trpcCall<UpdateOrganizationInput, Organization>('mdsign.organizations.update', 'mutation', input),
  
  delete: (id: number) =>
    trpcCall<{ id: number }, { success: boolean }>('mdsign.organizations.delete', 'mutation', { id }),
  
  addUser: (input: AddUserToOrgInput) =>
    trpcCall<AddUserToOrgInput, { success: boolean }>('mdsign.organizations.addUser', 'mutation', input),
  
  removeUser: (input: RemoveUserFromOrgInput) =>
    trpcCall<RemoveUserFromOrgInput, { success: boolean }>('mdsign.organizations.removeUser', 'mutation', input),
  
  users: (organizationId: number) =>
    trpcCall<{ organizationId: number }, OrganizationUser[]>('mdsign.organizations.users', 'query', { organizationId }),
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

// Billing procedures
export const trpcBilling = {
  createCustomer: () =>
    trpcCall<void, { customerId: string }>('billing.createCustomer', 'mutation'),
  
  createCheckout: (input: CreateCheckoutInput) =>
    trpcCall<CreateCheckoutInput, CheckoutResponse>('billing.createCheckout', 'mutation', input),
  
  getCustomerPortal: () =>
    trpcCall<void, CustomerPortalResponse>('billing.getCustomerPortal', 'query'),
};

// Export all as single object
export const trpc = {
  auth: trpcAuth,
  documents: trpcDocuments,
  folders: trpcFolders,
  organizations: trpcOrganizations,
  plans: trpcPlans,
  stats: trpcStats,
  lacuna: trpcLacuna,
  billing: trpcBilling,
};
