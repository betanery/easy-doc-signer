// tRPC Router Types - based on Manus backend API specification

// Auth types
export interface SignupInput {
  email: string;
  password: string;
  name: string;
  tenantName: string;
  cnpj?: string;
  planId: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  tenantId: number;
  tenant: {
    id: number;
    name: string;
    plan: string;
  };
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Document types
export type SignerRole = 'SIGNER' | 'APPROVER' | 'OBSERVER';
export type AuthType = 'EMAIL' | 'SMS' | 'EMAIL_SMS' | 'EMAIL_SELFIE';
export type SignatureType = 'ELECTRONIC' | 'DIGITAL_CERT';
export type DocumentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface DocumentSigner {
  name: string;
  email: string;
  role: SignerRole;
  orderStep: number;
  authType?: AuthType;
  signatureType?: SignatureType;
}

// CORRECTED: Upload input with contentType and fileBase64
export interface UploadInput {
  fileName: string;
  contentType: string; // MIME type (ex: "application/pdf")
  fileBase64: string;  // File encoded in base64
}

export interface UploadResponse {
  uploadId: string;
  fileName: string;
}

export interface CreateDocumentInput {
  uploadId: string;
  name: string;
  signers: DocumentSigner[];
  folderId?: number;
  expirationDate?: Date;
}

export interface ListDocumentsInput {
  status?: string;
  folderId?: number;
}

export interface DocumentFlowAction {
  id: string;
  signerName: string;
  signerEmail: string;
  status: string;
  signedAt?: string;
}

export interface Document {
  id: string; // CORRECTED: Lacuna document ID is string
  name: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  expirationDate?: string;
  flowActions: DocumentFlowAction[];
  folderId?: number;
}

// CORRECTED: CreateActionUrl input
export interface CreateActionUrlInput {
  documentId: string;
  flowActionId: string;
  identifierCpfCnpj?: string;
  email?: string;
  returnUrl?: string;
}

export interface SendReminderInput {
  documentId: string; // CORRECTED: string, not number
  flowActionId: string;
}

// Folder types (NOT AVAILABLE IN BACKEND - kept for type compatibility)
export interface CreateFolderInput {
  name: string;
  parentId?: number;
  color?: string;
  icon?: string;
}

export interface ListFoldersInput {
  parentId?: number | null;
  includeDocumentCount?: boolean;
}

export interface UpdateFolderInput {
  id: number;
  name?: string;
  parentId?: number | null;
  color?: string;
  icon?: string;
}

export interface DeleteFolderInput {
  id: number;
  force?: boolean;
}

export interface Folder {
  id: number;
  name: string;
  parentId?: number;
  color?: string;
  icon?: string;
  documentCount?: number;
  children?: Folder[];
}

// Organization types (NOT AVAILABLE IN BACKEND - kept for type compatibility)
export interface CreateOrganizationInput {
  name: string;
  lacunaOrganizationId?: string;
}

export interface ListOrganizationsInput {
  includeUserCount?: boolean;
}

export interface UpdateOrganizationInput {
  id: number;
  name?: string;
  lacunaOrganizationId?: string;
}

export interface AddUserToOrgInput {
  organizationId: number;
  userId: number;
}

export interface RemoveUserFromOrgInput {
  organizationId: number;
  userId: number;
}

export interface Organization {
  id: number;
  name: string;
  lacunaOrganizationId?: string;
  userCount?: number;
}

export interface OrganizationUser {
  id: number;
  name: string;
  email: string;
}

// Plans and Stats types
export type PlanName = 'CEDRO' | 'JACARANDA' | 'ANGICO' | 'AROEIRA' | 'IPE' | 'MOGNO';

export interface Plan {
  id: number;
  name: string;
  priceBRL: number; // CORRECTED: priceBRL not price
  documentsLimit: number | null;
  usersLimit: number | null;
  features: string[];
}

export interface Stats {
  plan: string;
  documentsUsed: number;
  documentsLimit: number | null;
  isUnlimited: boolean;
  usersCount: number;
  usersLimit: number | null;
}

export interface UpgradePlanInput {
  newPlanId: number;
}

// Lacuna config types
export interface ConfigureLacunaInput {
  lacunaApiKey: string;
  lacunaOrganizationId: string;
}

export interface LacunaStatus {
  configured: boolean;
  organizationId?: string;
}

// Billing types - CORRECTED
export interface CreateCheckoutSessionInput {
  planName: PlanName;
  billingInterval: 'monthly' | 'yearly';
}

export interface CheckoutResponse {
  url: string;
}

export interface CustomerPortalResponse {
  url: string;
}

// Legacy types for backward compatibility
export interface CreateCheckoutInput {
  planId: number;
}

export interface GenerateActionUrlInput {
  documentId: number;
  flowActionId: string;
}
