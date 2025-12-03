// MDSign Backend - Tipos TypeScript Completos
// Gerado a partir da documentação do Manus Backend

// ============ ENUMS ============
export type UserRole = "OWNER" | "USER";
export type SignerRole = "SIGNER" | "APPROVER" | "OBSERVER";
export type DocumentStatus = "SENT" | "PENDING" | "CONCLUDED" | "REFUSED" | "EXPIRED";
export type SignerStatus = "PENDING" | "SIGNED" | "REFUSED";
export type AuthType = "EMAIL" | "SMS" | "EMAIL_SMS" | "EMAIL_SELFIE";
export type SignatureType = "ELECTRONIC" | "DIGITAL_CERT";
export type LimitType = "FREE_TRIAL" | "MONTHLY" | "UNLIMITED";
export type PlanName = "CEDRO" | "JACARANDA" | "ANGICO" | "AROEIRA" | "IPE" | "MOGNO";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "PAST_DUE";

// ============ AUTH ============
export interface SignupInput {
  email: string;
  password: string;
  name: string;
  tenantName: string;
  cnpj?: string;
  planId: number;
}

export interface SignupOutput {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    tenantId: number;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    tenantId: number;
  };
}

export interface MeOutput {
  id: number;
  openId: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

// ============ DOCUMENTS ============
export interface UploadInput {
  fileName: string;
  fileContent: string;
}

export interface UploadOutput {
  success: boolean;
  uploadId: string;
}

export interface SignerInput {
  name: string;
  email: string;
  role: SignerRole;
  orderStep: number;
  authType?: AuthType;
  signatureType?: SignatureType;
  rubrica?: string;
}

export interface CreateDocumentInput {
  uploadId: string;
  name: string;
  signers: SignerInput[];
  folderId?: number;
  expirationDate?: string;
}

export interface DocumentSigner {
  id: number;
  documentId: number;
  name: string;
  email: string;
  role: SignerRole;
  orderStep: number;
  status: SignerStatus;
  authType: string;
  signatureType: string;
  lacunaFlowActionId: string;
  signedAt?: Date | null;
}

export interface CreateDocumentOutput {
  success: boolean;
  document: {
    id: number;
    tenantId: number;
    name: string;
    lacunaDocumentId: string;
    status: DocumentStatus;
    folderId: number | null;
    expirationDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  signers: DocumentSigner[];
}

export interface ListDocumentsInput {
  status?: DocumentStatus;
  folderId?: number;
}

export interface DocumentListItem {
  id: number;
  name: string;
  status: string;
  lacunaDocumentId: string;
  folderId: number | null;
  expirationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  signerCount: number;
  signedCount: number;
}

export interface ListDocumentsOutput {
  documents: DocumentListItem[];
}

export interface GetDocumentInput {
  id: number;
}

export interface GetDocumentOutput {
  id: number;
  tenantId: number;
  name: string;
  lacunaDocumentId: string;
  status: string;
  folderId: number | null;
  expirationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  signers: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    orderStep: number;
    status: string;
    authType: string;
    signatureType: string;
    lacunaFlowActionId: string;
    signedAt: Date | null;
  }>;
}

export interface GenerateActionUrlInput {
  documentId: number;
  flowActionId: string;
}

export interface GenerateActionUrlOutput {
  success: boolean;
  url: string;
}

export interface SendReminderInput {
  documentId: number;
  flowActionId: string;
}

export interface SendReminderOutput {
  success: boolean;
  message: string;
}

export interface DownloadDocumentInput {
  id: number;
}

export interface DownloadDocumentOutput {
  success: boolean;
  pdfContent: string;
  fileName: string;
}

// ============ FOLDERS ============
export interface CreateFolderInput {
  name: string;
  parentId?: number;
  color?: string;
  icon?: string;
}

export interface Folder {
  id: number;
  tenantId: number;
  name: string;
  parentId: number | null;
  color: string | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFolderOutput {
  success: boolean;
  folder: Folder;
}

export interface ListFoldersInput {
  parentId?: number | null;
  includeDocumentCount?: boolean;
}

export interface FolderListItem extends Folder {
  documentCount?: number;
}

export interface ListFoldersOutput {
  folders: FolderListItem[];
}

export interface GetFolderInput {
  id: number;
}

export interface GetFolderOutput extends Folder {
  documentCount: number;
  subfolderCount: number;
}

export interface FolderNode extends Folder {
  children: FolderNode[];
}

export interface FolderTreeOutput {
  tree: FolderNode[];
}

export interface UpdateFolderInput {
  id: number;
  name?: string;
  parentId?: number | null;
  color?: string | null;
  icon?: string | null;
}

export interface UpdateFolderOutput {
  success: boolean;
  folder: Folder;
}

export interface DeleteFolderInput {
  id: number;
  force?: boolean;
}

export interface DeleteFolderOutput {
  success: boolean;
  message: string;
}

// ============ ORGANIZATIONS ============
export interface CreateOrganizationInput {
  name: string;
  lacunaOrganizationId?: string;
}

export interface Organization {
  id: number;
  tenantId: number;
  name: string;
  lacunaOrganizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationOutput {
  success: boolean;
  organization: Organization;
}

export interface ListOrganizationsInput {
  includeUserCount?: boolean;
}

export interface OrganizationListItem extends Organization {
  userCount?: number;
}

export interface ListOrganizationsOutput {
  organizations: OrganizationListItem[];
}

export interface GetOrganizationInput {
  id: number;
}

export interface GetOrganizationOutput extends Organization {
  userCount: number;
}

export interface UpdateOrganizationInput {
  id: number;
  name?: string;
  lacunaOrganizationId?: string | null;
}

export interface UpdateOrganizationOutput {
  success: boolean;
  organization: Organization;
}

export interface DeleteOrganizationInput {
  id: number;
}

export interface DeleteOrganizationOutput {
  success: boolean;
  message: string;
}

export interface AddUserToOrganizationInput {
  organizationId: number;
  userId: number;
}

export interface AddUserToOrganizationOutput {
  success: boolean;
  message: string;
}

export interface RemoveUserFromOrganizationInput {
  organizationId: number;
  userId: number;
}

export interface RemoveUserFromOrganizationOutput {
  success: boolean;
  message: string;
}

export interface GetOrganizationUsersInput {
  organizationId: number;
}

export interface OrganizationUser {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  addedAt: Date;
}

export interface GetOrganizationUsersOutput {
  users: OrganizationUser[];
}

// ============ PLANS & STATS ============
export interface Plan {
  id: number;
  name: PlanName;
  displayName: string;
  description: string;
  price: number;
  limitType: LimitType;
  limitMonthlyDocuments: number | null;
  features: string[];
}

export interface PlansOutput {
  plans: Plan[];
}

export interface StatsOutput {
  currentPlan: {
    id: number;
    name: string;
    displayName: string;
    limitType: LimitType;
    limitMonthlyDocuments: number | null;
  };
  usage: {
    freeTrial?: {
      used: number;
      limit: number;
      remaining: number;
    };
    monthly?: {
      used: number;
      limit: number;
      remaining: number;
      yearMonth: string;
    };
    unlimited?: {
      totalDocuments: number;
    };
  };
  documents: {
    total: number;
    byStatus: {
      SENT: number;
      PENDING: number;
      CONCLUDED: number;
      REFUSED: number;
      EXPIRED: number;
    };
  };
  statistics: {
    averageCompletionTime: number;
    completionRate: number;
  };
}

export interface UpgradePlanInput {
  newPlanId: number;
}

export interface UpgradePlanOutput {
  success: boolean;
  message: string;
  subscription: {
    id: number;
    tenantId: number;
    planId: number;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  };
  newPlan: {
    id: number;
    name: string;
    displayName: string;
    limitType: string;
    limitMonthlyDocuments: number | null;
  };
}

// ============ LACUNA CONFIG ============
export interface ConfigureLacunaInput {
  lacunaApiKey: string;
  lacunaOrganizationId: string;
}

export interface ConfigureLacunaOutput {
  success: boolean;
  message: string;
}

export interface LacunaStatusOutput {
  configured: boolean;
  hasApiKey: boolean;
  hasOrganizationId: boolean;
  organizationId: string | null;
}

export interface RemoveLacunaCredentialsOutput {
  success: boolean;
  message: string;
}

// ============ BILLING ============
export interface CreateCustomerOutput {
  success: boolean;
  customerId: string;
}

export interface CreateCheckoutInput {
  planId: number;
}

export interface CreateCheckoutOutput {
  success: boolean;
  url: string;
}

export interface GetCustomerPortalOutput {
  success: boolean;
  url: string;
}

// ============ APP ROUTER TYPE ============
// This is a simplified type definition for the tRPC client
// The actual router is defined on the backend

// Placeholder AppRouter type - matches backend structure
export type AppRouter = {
  auth: {
    signup: { input: SignupInput; output: SignupOutput };
    login: { input: LoginInput; output: LoginOutput };
    me: { input: void; output: MeOutput };
  };
  plans: { input: void; output: PlansOutput };
  mdsign: {
    documents: {
      upload: { input: UploadInput; output: UploadOutput };
      create: { input: CreateDocumentInput; output: CreateDocumentOutput };
      list: { input: ListDocumentsInput; output: ListDocumentsOutput };
      get: { input: GetDocumentInput; output: GetDocumentOutput };
      createActionUrl: { input: GenerateActionUrlInput; output: GenerateActionUrlOutput };
      sendReminder: { input: SendReminderInput; output: SendReminderOutput };
      download: { input: DownloadDocumentInput; output: DownloadDocumentOutput };
      moveToFolder: { input: { documentId: string; folderId: number }; output: { success: boolean } };
    };
    folders: {
      create: { input: CreateFolderInput; output: CreateFolderOutput };
      list: { input: ListFoldersInput; output: ListFoldersOutput };
      get: { input: GetFolderInput; output: GetFolderOutput };
      tree: { input: void; output: FolderTreeOutput };
      update: { input: UpdateFolderInput; output: UpdateFolderOutput };
      delete: { input: DeleteFolderInput; output: DeleteFolderOutput };
    };
    organizations: {
      create: { input: CreateOrganizationInput; output: CreateOrganizationOutput };
      list: { input: ListOrganizationsInput; output: ListOrganizationsOutput };
      get: { input: GetOrganizationInput; output: GetOrganizationOutput };
      update: { input: UpdateOrganizationInput; output: UpdateOrganizationOutput };
      delete: { input: DeleteOrganizationInput; output: DeleteOrganizationOutput };
      addUser: { input: AddUserToOrganizationInput; output: AddUserToOrganizationOutput };
      removeUser: { input: RemoveUserFromOrganizationInput; output: RemoveUserFromOrganizationOutput };
      getUsers: { input: GetOrganizationUsersInput; output: GetOrganizationUsersOutput };
    };
    stats: { input: void; output: StatsOutput };
    upgradePlan: { input: UpgradePlanInput; output: UpgradePlanOutput };
    configureLacuna: { input: ConfigureLacunaInput; output: ConfigureLacunaOutput };
    lacunaStatus: { input: void; output: LacunaStatusOutput };
    removeLacunaCredentials: { input: void; output: RemoveLacunaCredentialsOutput };
  };
  billing: {
    createCheckoutSession: { input: CreateCheckoutInput; output: CreateCheckoutOutput };
    createPortalSession: { input: void; output: GetCustomerPortalOutput };
  };
};
