import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { z } from "zod";
import { trpc, setAuthToken } from "@/lib/trpc";
import { toast } from "sonner";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve ter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve ter pelo menos um número"),
  tenantName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  planId: z.number().min(1, "Selecione um plano"),
});

const Auth = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [planId, setPlanId] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // tRPC mutations
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (res: any) => {
      console.log("[Auth] Login success:", res);
      setAuthToken(res.token);
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.log("[Auth] Login error:", error);
      toast.error(error.message || "Erro ao fazer login");
    },
  });
  
  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (res: any) => {
      console.log("[Auth] Signup success:", res);
      setAuthToken(res.token);
      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.log("[Auth] Signup error:", error);
      toast.error(error.message || "Erro ao criar conta");
    },
  });
  
  const plansQuery = trpc.plans.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Extract plans from tRPC response
  const fallbackPlans = [
    { id: 1, name: "Cedro (Grátis)", priceBRL: "0.00" },
    { id: 2, name: "Jacarandá", priceBRL: "39.90" },
    { id: 3, name: "Angico", priceBRL: "99.97" },
    { id: 4, name: "Aroeira", priceBRL: "149.97" },
    { id: 5, name: "Ipê", priceBRL: "199.97" },
    { id: 6, name: "Mogno", priceBRL: "0.00" },
  ];
  
  const plansData = plansQuery.data;
  const plans = Array.isArray(plansData) 
    ? plansData 
    : (plansData as any)?.json 
      ? (plansData as any).json 
      : fallbackPlans;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    loginMutation.mutate({ email: email.trim(), password });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = signupSchema.safeParse({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      tenantName,
      planId,
    });
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[`signup_${err.path[0]}`] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    signupMutation.mutate({
      email: signupEmail.trim(),
      password: signupPassword,
      name: signupName.trim(),
      tenantName: tenantName.trim(),
      cnpj: cnpj.trim() || undefined,
      planId,
    });
  };

  const loading = loginMutation.isPending || signupMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Bem-vindo ao MDSign
          </h1>
          <p className="text-muted-foreground mt-2">
            Assinatura digital sustentável
          </p>
        </div>

        <Card className="border-primary/20 shadow-premium backdrop-blur-sm bg-card/95">
          <Tabs defaultValue="signin">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-white">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-white">
                  Criar Conta
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <CardTitle>Bem-vindo de volta</CardTitle>
                  <CardDescription>Entre com suas credenciais para acessar sua conta</CardDescription>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                      autoComplete="username"
                      required
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? "border-destructive" : ""}
                      autoComplete="current-password"
                      required
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <CardTitle>Criar uma conta</CardTitle>
                  <CardDescription>Preencha os dados abaixo para começar</CardDescription>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className={errors.signup_name ? "border-destructive" : ""}
                      required
                    />
                    {errors.signup_name && <p className="text-sm text-destructive">{errors.signup_name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className={errors.signup_email ? "border-destructive" : ""}
                      required
                    />
                    {errors.signup_email && <p className="text-sm text-destructive">{errors.signup_email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className={errors.signup_password ? "border-destructive" : ""}
                      required
                    />
                    {errors.signup_password && <p className="text-sm text-destructive">{errors.signup_password}</p>}
                    <p className="text-xs text-muted-foreground">Mínimo 8 caracteres, 1 maiúscula e 1 número</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-tenant">Nome da Empresa</Label>
                    <Input
                      id="signup-tenant"
                      type="text"
                      placeholder="Minha Empresa LTDA"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      className={errors.signup_tenantName ? "border-destructive" : ""}
                      required
                    />
                    {errors.signup_tenantName && <p className="text-sm text-destructive">{errors.signup_tenantName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-cnpj">CNPJ (Opcional)</Label>
                    <Input
                      id="signup-cnpj"
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-plan">Plano</Label>
                    <Select value={String(planId)} onValueChange={(v) => setPlanId(Number(v))}>
                      <SelectTrigger className={errors.signup_planId ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan: any) => (
                          <SelectItem key={plan.id} value={String(plan.id)}>
                            {plan.name} {plan.priceBRL && parseFloat(plan.priceBRL) > 0 ? `- R$ ${plan.priceBRL}/mês` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.signup_planId && <p className="text-sm text-destructive">{errors.signup_planId}</p>}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                    disabled={loading}
                  >
                    {loading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
