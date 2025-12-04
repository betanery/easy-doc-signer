import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { trpc, isAuthenticated } from "@/lib/trpc";
import { Loading } from "@/components/Loading";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useAuth";

export default function BillingPage() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useRequireAuth();
  const hasToken = isAuthenticated();
  
  const statsQuery = trpc.mdsign.stats.useQuery(undefined as any, { enabled: hasToken });
  const plansQuery = trpc.plans.useQuery(undefined as any, { enabled: hasToken });
  const checkoutMutation = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: (data: any) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao iniciar checkout");
    },
  });

  const handleUpgrade = (planName: string) => {
    (checkoutMutation.mutate as any)({ planName, billingCycle: 'monthly' });
  };

  const stats = statsQuery.data as any;
  const currentPlan = stats?.currentPlan;
  const usage = stats?.usage;

  const getUsageInfo = () => {
    if (usage?.freeTrial) {
      return {
        used: usage.freeTrial.used,
        limit: usage.freeTrial.limit,
        remaining: usage.freeTrial.remaining,
        label: "documentos (total)",
      };
    }
    if (usage?.monthly) {
      return {
        used: usage.monthly.used,
        limit: usage.monthly.limit,
        remaining: usage.monthly.remaining,
        label: "documentos este mês",
      };
    }
    if (usage?.unlimited) {
      return {
        used: usage.unlimited.totalDocuments,
        limit: null,
        remaining: null,
        label: "documentos (ilimitado)",
      };
    }
    return null;
  };

  const usageInfo = getUsageInfo();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Cobrança e Planos</h1>
            <p className="text-muted-foreground">Gerencie sua assinatura e veja seu consumo</p>
          </div>

          {(authLoading || statsQuery.isLoading) ? (
            <Loading />
          ) : (
            <div className="grid gap-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Plano Atual</CardTitle>
                      <CardDescription>Seu plano e consumo atual</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                      {currentPlan?.displayName || currentPlan?.name || "Cedro"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {usageInfo && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uso de documentos</span>
                        <span className="font-medium">
                          {usageInfo.used}
                          {usageInfo.limit ? ` / ${usageInfo.limit}` : ""} {usageInfo.label}
                        </span>
                      </div>
                      {usageInfo.limit && (
                        <Progress
                          value={(usageInfo.used / usageInfo.limit) * 100}
                          className="h-3"
                        />
                      )}
                      {usageInfo.remaining !== null && (
                        <p className="text-sm text-muted-foreground">
                          Restam {usageInfo.remaining} {usageInfo.label}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <ManageSubscriptionButton />
                    <Button variant="outline" onClick={() => navigate("/planos")}>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Ver todos os planos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Available Plans */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Planos Disponíveis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(plansQuery.data as any)?.plans?.map((plan: any) => (
                    <Card
                      key={plan.id}
                      className={`relative ${
                        currentPlan?.id === plan.id ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      {currentPlan?.id === plan.id && (
                        <Badge className="absolute -top-2 -right-2">Atual</Badge>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.displayName}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="text-2xl font-bold">
                          {plan.price === 0
                            ? "Grátis"
                            : `R$ ${(plan.price / 100).toFixed(2).replace(".", ",")}`}
                          {plan.price > 0 && (
                            <span className="text-sm font-normal text-muted-foreground">
                              /mês
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {plan.features?.slice(0, 4).map((feature: string, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-status-success" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="w-full"
                          variant={currentPlan?.id === plan.id ? "outline" : "default"}
                          disabled={currentPlan?.id === plan.id || checkoutMutation.isPending}
                          onClick={() => handleUpgrade(plan.name)}
                        >
                          {checkoutMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : currentPlan?.id === plan.id ? (
                            "Plano atual"
                          ) : plan.price === 0 ? (
                            "Plano gratuito"
                          ) : (
                            "Fazer upgrade"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
