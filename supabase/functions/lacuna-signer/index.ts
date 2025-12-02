import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Allowed origins for CORS - restrict to your application domains
const allowedOrigins = [
  'https://jloqdyvkcpsixgnakxgy.lovableproject.com',
  'https://lovable.dev',
  'http://localhost:5173',
  'http://localhost:3000',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// Input validation schemas
const signerSchema = z.object({
  name: z.string().min(1, "Signer name is required").max(100, "Signer name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  identifier: z.string().max(50, "Identifier too long").optional(),
});

const createDocumentSchema = z.object({
  action: z.literal('create'),
  fileName: z.string().min(1, "File name is required").max(255, "File name too long"),
  fileContent: z.string().min(1, "File content is required").max(50_000_000, "File too large"), // ~37MB base64
  signers: z.array(signerSchema).min(1, "At least one signer is required").max(50, "Too many signers"),
  description: z.string().max(1000, "Description too long").optional(),
});

const listDocumentsSchema = z.object({
  action: z.literal('list'),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

const getDocumentSchema = z.object({
  action: z.literal('get'),
  documentId: z.string().uuid("Invalid document ID"),
});

const addSignerSchema = z.object({
  action: z.literal('add-signer'),
  documentId: z.string().uuid("Invalid document ID"),
  signer: signerSchema,
});

const deleteDocumentSchema = z.object({
  action: z.literal('delete'),
  documentId: z.string().uuid("Invalid document ID"),
});

const requestBodySchema = z.discriminatedUnion('action', [
  createDocumentSchema,
  listDocumentsSchema,
  getDocumentSchema,
  addSignerSchema,
  deleteDocumentSchema,
]);

type RequestBody = z.infer<typeof requestBodySchema>;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const lacunaApiKey = Deno.env.get('LACUNA_API_KEY');
    const lacunaEndpoint = Deno.env.get('LACUNA_API_ENDPOINT');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!lacunaApiKey || !lacunaEndpoint) {
      console.error('Missing Lacuna credentials');
      return new Response(
        JSON.stringify({ error: 'Lacuna Signer credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role to verify user
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's tenant_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) {
      return new Response(
        JSON.stringify({ error: 'User not associated with a tenant' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = requestBodySchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data', 
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = validationResult.data;
    const lacunaHeaders = {
      'Authorization': `Bearer ${lacunaApiKey}`,
      'Content-Type': 'application/json',
    };

    console.log(`Processing action: ${body.action} for user: ${user.id}`);

    // Handle different actions
    switch (body.action) {
      case 'create': {
        // Create document in Lacuna Signer
        const createPayload = {
          files: [{
            displayName: body.fileName,
            content: body.fileContent,
            mimeType: 'application/pdf'
          }],
          signers: body.signers.map((signer, index) => ({
            name: signer.name,
            email: signer.email,
            identifier: signer.identifier || signer.email,
            order: index + 1,
            action: {
              type: 'Signature'
            }
          })),
          description: body.description || `Document created by ${user.email}`
        };

        const lacunaResponse = await fetch(`${lacunaEndpoint}/api/documents`, {
          method: 'POST',
          headers: lacunaHeaders,
          body: JSON.stringify(createPayload)
        });

        if (!lacunaResponse.ok) {
          const errorText = await lacunaResponse.text();
          console.error('Lacuna API error:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to create document in Lacuna Signer', details: errorText }),
            { status: lacunaResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const lacunaDocument = await lacunaResponse.json();
        console.log('Document created in Lacuna:', lacunaDocument.id);

        // Cache document in our database
        const { data: cachedDoc, error: cacheError } = await supabase
          .from('documents_cache')
          .insert({
            tenant_id: profile.tenant_id,
            lacuna_document_id: lacunaDocument.id,
            document_data: lacunaDocument
          })
          .select()
          .single();

        if (cacheError) {
          console.error('Error caching document:', cacheError);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            document: lacunaDocument,
            cached: !cacheError
          }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        const limit = body.limit || 50;
        const offset = body.offset || 0;

        // First, try to get from cache
        const { data: cachedDocs, error: cacheError } = await supabase
          .from('documents_cache')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (cacheError) {
          console.error('Error fetching cached documents:', cacheError);
        }

        // Also fetch fresh data from Lacuna
        const lacunaResponse = await fetch(
          `${lacunaEndpoint}/api/documents?limit=${limit}&offset=${offset}`,
          { headers: lacunaHeaders }
        );

        if (!lacunaResponse.ok) {
          const errorText = await lacunaResponse.text();
          console.error('Lacuna API error:', errorText);
          
          // Return cached data if Lacuna fails
          if (cachedDocs) {
            return new Response(
              JSON.stringify({ 
                documents: cachedDocs.map(d => d.document_data),
                fromCache: true 
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          return new Response(
            JSON.stringify({ error: 'Failed to fetch documents', details: errorText }),
            { status: lacunaResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const lacunaDocuments = await lacunaResponse.json();

        return new Response(
          JSON.stringify({ 
            documents: lacunaDocuments,
            fromCache: false 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get': {
        // Get document from Lacuna
        const lacunaResponse = await fetch(
          `${lacunaEndpoint}/api/documents/${body.documentId}`,
          { headers: lacunaHeaders }
        );

        if (!lacunaResponse.ok) {
          const errorText = await lacunaResponse.text();
          console.error('Lacuna API error:', errorText);
          
          // Try to get from cache
          const { data: cachedDoc } = await supabase
            .from('documents_cache')
            .select('document_data')
            .eq('lacuna_document_id', body.documentId)
            .eq('tenant_id', profile.tenant_id)
            .single();

          if (cachedDoc) {
            return new Response(
              JSON.stringify({ 
                document: cachedDoc.document_data,
                fromCache: true 
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ error: 'Document not found', details: errorText }),
            { status: lacunaResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const document = await lacunaResponse.json();

        // Update cache
        await supabase
          .from('documents_cache')
          .upsert({
            tenant_id: profile.tenant_id,
            lacuna_document_id: body.documentId,
            document_data: document
          });

        return new Response(
          JSON.stringify({ 
            document,
            fromCache: false 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'add-signer': {
        // Add signer to existing document
        const addSignerPayload = {
          name: body.signer.name,
          email: body.signer.email,
          identifier: body.signer.identifier || body.signer.email,
          action: {
            type: 'Signature'
          }
        };

        const lacunaResponse = await fetch(
          `${lacunaEndpoint}/api/documents/${body.documentId}/participants`,
          {
            method: 'POST',
            headers: lacunaHeaders,
            body: JSON.stringify(addSignerPayload)
          }
        );

        if (!lacunaResponse.ok) {
          const errorText = await lacunaResponse.text();
          console.error('Lacuna API error:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to add signer', details: errorText }),
            { status: lacunaResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await lacunaResponse.json();

        // Update cache
        const { data: updatedDoc } = await supabase
          .from('documents_cache')
          .select('document_data')
          .eq('lacuna_document_id', body.documentId)
          .eq('tenant_id', profile.tenant_id)
          .single();

        if (updatedDoc) {
          const documentData = updatedDoc.document_data as any;
          documentData.participants = [...(documentData.participants || []), result];
          
          await supabase
            .from('documents_cache')
            .update({ document_data: documentData })
            .eq('lacuna_document_id', body.documentId)
            .eq('tenant_id', profile.tenant_id);
        }

        return new Response(
          JSON.stringify({ success: true, signer: result }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        // Delete document from Lacuna
        const lacunaResponse = await fetch(
          `${lacunaEndpoint}/api/documents/${body.documentId}`,
          {
            method: 'DELETE',
            headers: lacunaHeaders
          }
        );

        if (!lacunaResponse.ok) {
          const errorText = await lacunaResponse.text();
          console.error('Lacuna API error:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to delete document', details: errorText }),
            { status: lacunaResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete from cache
        await supabase
          .from('documents_cache')
          .delete()
          .eq('lacuna_document_id', body.documentId)
          .eq('tenant_id', profile.tenant_id);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: any) {
    console.error('Error in lacuna-signer function:', error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
