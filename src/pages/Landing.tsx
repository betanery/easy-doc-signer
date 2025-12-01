import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { 
  FileText, 
  Clock, 
  Shield, 
  Leaf, 
  Users, 
  CheckCircle, 
  TrendingUp,
  Globe,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  MessageCircle
} from "lucide-react";

const Landing = () => {
  const benefits = [
    { icon: FileText, title: "Assinatura Digital", description: "100% válida juridicamente" },
    { icon: Clock, title: "Economia de Tempo", description: "Assine em segundos" },
    { icon: Shield, title: "Segurança Total", description: "Criptografia de ponta" },
    { icon: Leaf, title: "Sustentável", description: "Zero papel, zero impacto" },
    { icon: Users, title: "Multi-usuários", description: "Toda equipe integrada" },
    { icon: CheckCircle, title: "Fácil de Usar", description: "Interface intuitiva" },
    { icon: TrendingUp, title: "Reduza Custos", description: "Economize até 90%" },
    { icon: Globe, title: "Acesso Global", description: "De qualquer lugar" },
  ];

  const plans = [
    {
      name: "Cedro – Gratuito",
      subtitle: "Perfil ideal: Pessoa física, uso esporádico",
      price: "R$ 0",
      period: "",
      features: [
        "Documentos/mês: 5",
        "Usuários: 1",
        "Acesso básico à plataforma",
        "Assinatura eletrônica simples",
        "Experiência inicial sem custo"
      ],
      popular: false,
    },
    {
      name: "Jacarandá – Essencial",
      subtitle: "Perfil ideal: Microempreendedor ou autônomo",
      price: "R$ 39,90",
      period: "ou R$ 427,00/ano (+ de 10% de desconto)",
      features: [
        "Documentos/mês: 20",
        "Usuários: 1",
        "Assinatura eletrônica e com certificado digital",
        "Armazenamento em nuvem",
        "Atendimento à LGPD"
      ],
      popular: false,
    },
    {
      name: "Angico – Profissional",
      subtitle: "Perfil ideal: Profissional liberal ou pequena equipe",
      price: "R$ 99,97",
      period: "ou R$ 1.097,00/ano (+ de 10% de desconto)",
      features: [
        "Documentos/mês: Ilimitado",
        "Usuários: Até 4 usuários",
        "Assinaturas ilimitadas",
        "Suporte prioritário",
        "Validação por e-mail e SMS",
        "Permissões básicas para equipe"
      ],
      popular: true,
    },
    {
      name: "Aroeira – PME Básica",
      subtitle: "Perfil ideal: Pequena empresa em expansão",
      price: "R$ 149,97",
      period: "ou R$ 1.499,97/ano (ganhe 2 mensalidades)",
      features: [
        "Documentos/mês: Ilimitado",
        "Usuários: Até 6 usuários",
        "Criação de fluxos personalizados",
        "Acesso a múltiplos signatários",
        "Pastas organizacionais por projeto ou equipe"
      ],
      popular: false,
    },
    {
      name: "Ipê – PME Completa",
      subtitle: "Perfil ideal: PME com múltiplas áreas e equipes",
      price: "R$ 199,97",
      period: "ou R$ 1.999,97/ano (ganhe 2 mensalidades)",
      features: [
        "Documentos/mês: Ilimitado",
        "Usuários: Até 10 usuários",
        "Acesso multiusuário completo",
        "Integração com sistemas via API",
        "Geração de documentos em massa (CSV)",
        "Webhook para sistemas externos"
      ],
      popular: false,
    },
    {
      name: "Mogno – Corporativo",
      subtitle: "Perfil ideal: Empresas de médio a grande porte",
      price: "A conferir",
      period: "Preços especiais para quem precisa de mais robustez e atendimento diferenciado",
      features: [
        "Documentos/mês: Ilimitado",
        "Usuários: Ilimitado",
        "Gestão de permissões avançada",
        "Múltiplas organizações",
        "Suporte premium e customizações",
        "Ideal para franqueadoras, grupos empresariais e organizações com alta demanda"
      ],
      popular: false,
    }
  ];

  const faqs = [
    {
      question: "Posso testar o SignDoc grátis antes de contratar?",
      answer: "Sim! Com o Plano Grátis do SignDoc você pode experimentar a plataforma sem pagar nada. Você pode enviar até 5 documentos por mês para assinatura, com assinatura gratuita para você e para quem for assinar. Cada envio pode incluir vários documentos e múltiplos signatários."
    },
    {
      question: "Posso assinar qualquer tipo de documento?",
      answer: "Sim! Você pode assinar contratos, propostas, termos, autorizações, declarações e qualquer outro tipo de documento eletrônico em PDF."
    },
    {
      question: "Como envio um documento para assinatura?",
      answer: "Basta acessar sua conta, clicar em 'Novo envio', fazer o upload do documento e definir quem precisa assinar. Você também pode definir a ordem das assinaturas, adicionar anexos e configurar prazos."
    },
    {
      question: "Como assino um documento?",
      answer: "Ao receber o link por e-mail, SMS ou WhatsApp, basta clicar, revisar o documento e assinar eletronicamente. Se você tiver um certificado digital, também pode utilizá-lo."
    },
    {
      question: "Todos que assinam precisam ter uma conta no SignDoc?",
      answer: "Não! Apenas quem cria o envio precisa ter uma conta. Quem for assinar recebe um link e pode assinar de forma segura e gratuita, sem precisar se cadastrar."
    },
    {
      question: "O que é um envio?",
      answer: "Um envio é o processo de encaminhar um ou mais documentos para uma ou mais pessoas assinarem. Cada envio pode conter vários arquivos e múltiplos signatários, com rastreamento completo."
    },
    {
      question: "Como funciona a cobrança dos planos?",
      answer: "Os planos são mensais ou anuais, com pagamento recorrente no cartão de crédito. Planos anuais oferecem descontos e bônus, como 2 meses grátis nos planos Aroeira, Ipê e Mogno."
    },
    {
      question: "O que são usuários e como funciona o limite de usuários?",
      answer: "Usuários são pessoas da sua equipe com acesso ao painel do SignDoc. Cada plano possui um número específico de usuários. Exemplo: Angico: até 4 usuários, Aroeira: até 6 usuários, Ipê: até 10 usuários, Mogno: usuários ilimitados."
    },
    {
      question: "Posso compartilhar minha conta com outra pessoa?",
      answer: "Não é recomendado. Cada usuário tem seu próprio acesso para garantir segurança, rastreabilidade e permissões específicas. Nos planos pagos, você pode adicionar usuários conforme sua equipe."
    },
    {
      question: "Preciso de um certificado digital para usar o SignDoc?",
      answer: "Não! O SignDoc funciona com assinatura eletrônica simples, válida legalmente. Se você quiser, pode usar certificado digital A1, A3 ou em nuvem, sem custo adicional no plano."
    },
    {
      question: "Como pago meus envios (documentos)?",
      answer: "Se você estiver no plano gratuito, não paga nada. Nos planos pagos, você tem documentos ilimitados (exceto no Jacarandá). O pagamento é feito via cartão de crédito mensal ou anual."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-lg shadow-elegant">
        <div className="container flex h-20 items-center justify-between">
          <Logo size="md" showText={false} />
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#beneficios" className="text-sm font-medium hover:text-primary transition-colors">
              Benefícios
            </a>
            <a href="#planos" className="text-sm font-medium hover:text-primary transition-colors">
              Planos
            </a>
            <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="outline" className="border-primary hover:bg-primary hover:text-white">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-mdsign-gradient-start to-mdsign-gradient-end py-20 md:py-32">
        <div className="container relative z-10">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="text-white space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Assine documentos em segundos. Economize tempo, reduza custos e salve o planeta!
              </h1>
              <p className="text-xl text-white/90">
                Com o SignDoc, você automatiza assinaturas, elimina papelada e ainda contribui com o meio ambiente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-mdsign-teal hover:bg-mdsign-teal/90 text-lg px-8">
                    Comece Grátis Agora
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8">
                    Acessar Minha Conta
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center">
              <Leaf className="h-64 w-64 text-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Por que escolher o MDSign?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Tecnologia de ponta para transformar a forma como você assina documentos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-premium transition-all duration-300 hover:-translate-y-2 border-primary/20 hover:border-primary/40 overflow-hidden relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <benefit.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-xl text-muted-foreground">
              Todos os planos incluem 7 dias de teste grátis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm mb-2">{plan.subtitle}</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-primary">{plan.price}</span>
                    {plan.price !== "A conferir" && plan.price !== "R$ 0" && <span className="text-sm text-muted-foreground">/mês</span>}
                  </div>
                  {plan.period && (
                    <p className="text-xs text-muted-foreground mt-1">{plan.period}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-mdsign-teal flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/auth" className="w-full">
                    <Button className="w-full bg-mdsign-orange hover:bg-mdsign-orange/90">
                      Assine agora
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="como-funciona" className="py-20 bg-secondary">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Perguntas Frequentes
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-background rounded-lg px-6 border">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-mdsign-purple-dark text-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-8 w-8" />
                <span className="text-2xl font-bold">SignDoc</span>
              </div>
              <p className="text-white/80 mb-6">
                Transformando a gestão de documentos com sustentabilidade e tecnologia.
              </p>
              <Link to="/auth">
                <Button className="w-full bg-mdsign-orange hover:bg-mdsign-orange/90">
                  Comece grátis agora
                </Button>
              </Link>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Atendimento</h3>
              <div className="space-y-3 text-white/80">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(61) 3345-9494</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>08:00 às 20:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contato@signdoc.com.br</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Institucional</h3>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a 
                    href="https://mundodigitaltech.com.br/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Mundo Digital Tech
                  </a>
                </li>
                <li>
                  <a 
                    href="https://mundodigitaltech.com.br/quem-somos/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Sobre nós
                  </a>
                </li>
                <li>
                  <a 
                    href="https://mundodigitaltech.com.br/post/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>Mais produtos DOC</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Redes Sociais</h3>
              <div className="flex gap-4">
                <a 
                  href="https://wa.me/5561999338061" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <MessageCircle className="h-6 w-6" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>&copy; {new Date().getFullYear()} SignDoc. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
