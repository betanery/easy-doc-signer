import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const tenantFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cnpj: z.string().optional(),
  plan: z.enum(["cedro", "jacaranda", "angico", "aroeira", "ipe", "mogno"]),
  max_users: z.coerce.number().min(1, "Mínimo de 1 usuário"),
  monthly_doc_limit: z.coerce.number().min(0, "Limite deve ser maior ou igual a 0"),
  lacuna_api_key: z.string().optional(),
  lacuna_organization_id: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

interface TenantFormProps {
  tenant?: any;
  onSaved: () => void;
  onCancel: () => void;
}

export const TenantForm = ({ tenant, onSaved, onCancel }: TenantFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: tenant?.name || "",
      cnpj: tenant?.cnpj || "",
      plan: tenant?.plan || "cedro",
      max_users: tenant?.max_users || 1,
      monthly_doc_limit: tenant?.monthly_doc_limit || 5,
      lacuna_api_key: tenant?.lacuna_api_key || "",
      lacuna_organization_id: tenant?.lacuna_organization_id || "",
    },
  });

  const onSubmit = async (values: TenantFormValues) => {
    setLoading(true);
    try {
      if (tenant) {
        // Update existing tenant
        const { error } = await supabase
          .from("tenants")
          .update({
            name: values.name,
            cnpj: values.cnpj || null,
            plan: values.plan,
            max_users: values.max_users,
            monthly_doc_limit: values.monthly_doc_limit,
            lacuna_api_key: values.lacuna_api_key || null,
            lacuna_organization_id: values.lacuna_organization_id || null,
          })
          .eq("id", tenant.id);

        if (error) throw error;

        toast({
          title: "Tenant atualizado",
          description: "As informações foram atualizadas com sucesso.",
        });
      } else {
        // Create new tenant
        const { error } = await supabase
          .from("tenants")
          .insert([{
            name: values.name,
            cnpj: values.cnpj || null,
            plan: values.plan,
            max_users: values.max_users,
            monthly_doc_limit: values.monthly_doc_limit,
            lacuna_api_key: values.lacuna_api_key || null,
            lacuna_organization_id: values.lacuna_organization_id || null,
          }]);

        if (error) throw error;

        toast({
          title: "Tenant criado",
          description: "O tenant foi criado com sucesso.",
        });
      }

      onSaved();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const planOptions = [
    { value: "cedro", label: "Cedro (Gratuito)", users: 1, docs: 5 },
    { value: "jacaranda", label: "Jacarandá (R$ 39,90)", users: 1, docs: 20 },
    { value: "angico", label: "Angico (R$ 99,97)", users: 4, docs: -1 },
    { value: "aroeira", label: "Aroeira (R$ 149,97)", users: 6, docs: -1 },
    { value: "ipe", label: "Ipê (R$ 199,97)", users: 10, docs: -1 },
    { value: "mogno", label: "Mogno (Corporativo)", users: -1, docs: -1 },
  ];

  const handlePlanChange = (planValue: string) => {
    const plan = planOptions.find(p => p.value === planValue);
    if (plan) {
      if (plan.users > 0) form.setValue("max_users", plan.users);
      if (plan.docs > 0) form.setValue("monthly_doc_limit", plan.docs);
      if (plan.docs === -1) form.setValue("monthly_doc_limit", 999999);
      if (plan.users === -1) form.setValue("max_users", 999);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tenant ? "Editar Tenant" : "Novo Tenant"}</CardTitle>
        <CardDescription>
          {tenant
            ? "Atualize as informações do tenant"
            : "Preencha os dados para criar um novo tenant"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Tenant</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da organização" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0000-00" {...field} />
                  </FormControl>
                  <FormDescription>
                    CNPJ da organização (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePlanChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {planOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_users"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Usuários</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_doc_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Documentos/Mês</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="lacuna_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lacuna API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="API Key do Lacuna Signer" {...field} />
                  </FormControl>
                  <FormDescription>
                    Chave de API para integração com Lacuna Signer (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lacuna_organization_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lacuna Organization ID</FormLabel>
                  <FormControl>
                    <Input placeholder="ID da organização no Lacuna" {...field} />
                  </FormControl>
                  <FormDescription>
                    ID da organização no Lacuna Signer (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : tenant ? "Atualizar" : "Criar"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};