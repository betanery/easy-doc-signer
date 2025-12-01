import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateDocumentRequest {
  action: 'create';
  fileName: string;
  fileContent: string; // base64
  signers: Array<{
    name: string;
    email: string;
    identifier?: string;
  }>;
  description?: string;
}

interface ListDocumentsRequest {
  action: 'list';
  limit?: number;
  offset?: number;
}

interface GetDocumentRequest {
  action: 'get';
  documentId: string;
}

interface AddSignerRequest {
  action: 'add-signer';
  documentId: string;
  signer: {
    name: string;
    email: string;
    identifier?: string;
  };
}

interface DeleteDocumentRequest {
  action: 'delete';
  documentId: string;
}

type RequestBody = CreateDocumentRequest | ListDocumentsRequest | GetDocumentRequest | AddSignerRequest | DeleteDocumentRequest;

serve(async (req) => {
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

    const body: RequestBody = await req.json();
    const lacunaHeaders = {
      'Authorization': `Bearer ${lacunaApiKey}`,
      'Content-Type': 'application/json',
    };

    console.log(`Processing action: ${body.action}`);

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
        console.log('Document created in Lacuna:', lacunaDocument);

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
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
