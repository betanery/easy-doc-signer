import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Stats {
  totalDocuments: number;
  documentsThisMonth: number;
  monthlyLimit: number;
  totalUsers: number;
  maxUsers: number;
  planName: string;
}

export const DashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    documentsThisMonth: 0,
    monthlyLimit: 5,
    totalUsers: 0,
    maxUsers: 1,
    planName: "cedro",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's profile and tenant
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (!profile?.tenant_id) {
        setLoading(false);
        return;
      }

      // Get tenant info
      const { data: tenant } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", profile.tenant_id)
        .single();

      // Get total documents
      const { count: totalDocs } = await supabase
        .from("documents_cache")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", profile.tenant_id);

      // Get documents this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: docsThisMonth } = await supabase
        .from("documents_cache")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", profile.tenant_id)
        .gte("created_at", firstDayOfMonth.toISOString());

      // Get total users in tenant
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", profile.tenant_id);

      setStats({
        totalDocuments: totalDocs || 0,
        documentsThisMonth: docsThisMonth || 0,
        monthlyLimit: tenant?.monthly_doc_limit || 5,
        totalUsers: totalUsers || 0,
        maxUsers: tenant?.max_users || 1,
        planName: tenant?.plan || "cedro",
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const documentUsagePercentage = (stats.documentsThisMonth / stats.monthlyLimit) * 100;
  const userUsagePercentage = (stats.totalUsers / stats.maxUsers) * 100;

  const getPlanDisplayName = (plan: string) => {
    const plans: Record<string, string> = {
      cedro: "Cedro (Gratuito)",
      jacaranda: "Jacarandá",
      angico: "Angico",
      aroeira: "Aroeira",
      ipe: "Ipê",
      mogno: "Mogno",
    };
    return plans[plan] || plan;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">Todos os tempos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Este Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.documentsThisMonth} / {stats.monthlyLimit}
            </div>
            <Progress value={documentUsagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {documentUsagePercentage.toFixed(0)}% utilizado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers} / {stats.maxUsers}
            </div>
            <Progress value={userUsagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {userUsagePercentage.toFixed(0)}% da capacidade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPlanDisplayName(stats.planName)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyLimit === 999999 ? "Ilimitado" : `${stats.monthlyLimit} docs/mês`}
            </p>
          </CardContent>
        </Card>
      </div>

      {documentUsagePercentage >= 80 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              Atenção: Limite de Documentos
            </CardTitle>
            <CardDescription>
              Você está usando {stats.documentsThisMonth} de {stats.monthlyLimit} documentos
              este mês. Considere fazer upgrade do seu plano.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};