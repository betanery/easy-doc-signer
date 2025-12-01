-- Add additional fields to tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'cedro',
ADD COLUMN IF NOT EXISTS lacuna_api_key text,
ADD COLUMN IF NOT EXISTS lacuna_organization_id text,
ADD COLUMN IF NOT EXISTS monthly_doc_limit integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS docs_used_this_month integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_users integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly';

-- Create index for faster tenant lookups
CREATE INDEX IF NOT EXISTS idx_tenants_cnpj ON public.tenants(cnpj);

-- Add RLS policy for users to update their own tenant (if they're admin)
CREATE POLICY "Tenant admins can update their tenant"
ON public.tenants
FOR UPDATE
USING (
  id IN (
    SELECT profiles.tenant_id
    FROM profiles
    WHERE profiles.id = auth.uid()
  )
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Update profiles table to ensure tenant_id references tenants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
  END IF;
END $$;