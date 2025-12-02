import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { ArrowLeft, Check, Crown, Leaf, TreeDeciduous, Trees, Flower2, TreePine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    id: 'cedro',
    name: 'Cedro',
    icon: Leaf,
    price: 'R$ 0,00',
    period: 'Grátis',
    docs: '5 documentos TOTAL',
    users: '1 usuário',
    features: ['5 envios gratuitos', 'Assinatura digital válida', 'Suporte por e-mail'],
    highlight: false,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'jacaranda',
    name: 'Jacarandá',
    icon: TreeDeciduous,
    price: 'R$ 39,90',
    priceAnnual: 'R$ 427,00/ano',
    period: '/mês',
    docs: '20 documentos/mês',
    users: '1 usuário',
    features: ['20 documentos mensais', 'Assinatura digital válida', 'Suporte prioritário', 'Histórico de documentos'],
    highlight: false,
    color: 'from-purple-500 to-violet-600',
  },
  {
    id: 'angico',
    name: 'Angico',
    icon: Trees,
    price: 'R$ 99,97',
    priceAnnual: 'R$ 1.097,00/ano',
    period: '/mês',
    docs: 'Documentos ilimitados',
    users: '4 usuários',
    features: ['Documentos ilimitados', '4 usuários inclusos', 'API disponível', 'Suporte dedicado', 'Relatórios avançados'],
    highlight: true,
    color: 'from-[#CEA32A] to-[#E5B82A]',
  },
  {
    id: 'aroeira',
    name: 'Aroeira',
    icon: Flower2,
    price: 'R$ 149,97',
    priceAnnual: 'R$ 1.499,97/ano',
    period: '/mês',
    docs: 'Documentos ilimitados',
    users: '6 usuários',
    features: ['Documentos ilimitados', '6 usuários inclusos', 'API disponível', 'Webhooks', 'Suporte VIP', '2 meses grátis (anual)'],
    highlight: false,
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'ipe',
    name: 'Ipê',
    icon: TreePine,
    price: 'R$ 199,97',
    priceAnnual: 'R$ 1.999,97/ano',
    period: '/mês',
    docs: 'Documentos ilimitados',
    users: '10 usuários',
    features: ['Documentos ilimitados', '10 usuários inclusos', 'API completa', 'Webhooks', 'Geração em massa', 'Suporte premium', '2 meses grátis (anual)'],
    highlight: false,
    color: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'mogno',
    name: 'Mogno',
    icon: Crown,
    price: 'Sob consulta',
    period: '',
    docs: 'Documentos ilimitados',
    users: 'Usuários ilimitados',
    features: ['Documentos ilimitados', 'Usuários ilimitados', 'API enterprise', 'White-label', 'SLA garantido', 'Gerente de conta dedicado', 'Customizações'],
    highlight: false,
    color: 'from-[#112145] to-[#1a3266]',
  },
];

export default function Plans() {
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    if (planId === 'mogno') {
      window.open('https://wa.me/5561999338061?text=Olá! Gostaria de saber mais sobre o plano Mogno.', '_blank');
    } else {
      // TODO: Integrate with checkout
      navigate(`/checkout?plano=${planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur-lg">
        <div className="container flex h-20 items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-primary/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="md" className="ml-4" />
        </div>
      </header>

      <main className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Escolha o plano ideal para você
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece grátis e escale conforme sua necessidade. Todos os planos incluem assinatura digital com validade jurídica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  plan.highlight ? 'ring-2 ring-[#CEA32A] shadow-lg' : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-gradient-to-r from-[#CEA32A] to-[#E5B82A] text-white border-none">
                      Mais popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                    {plan.priceAnnual && (
                      <p className="text-sm mt-1 text-muted-foreground">ou {plan.priceAnnual}</p>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-primary">{plan.docs}</p>
                    <p className="text-muted-foreground">{plan.users}</p>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-status-success flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-[#CEA32A] to-[#E5B82A] hover:from-[#D4A72E] hover:to-[#EABD30] text-white'
                        : ''
                    }`}
                    variant={plan.highlight ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.id === 'cedro' ? 'Começar grátis' : plan.id === 'mogno' ? 'Falar com vendas' : 'Assinar agora'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
