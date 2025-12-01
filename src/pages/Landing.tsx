import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
  Linkedin
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
      name: "Ipê",
      price: "R$ 99,00",
      documents: "50 documentos/mês",
      features: ["Assinatura digital", "Suporte por email", "1 usuário"],
      popular: false,
    },
    {
      name: "Jatobá",
      price: "R$ 199,00",
      documents: "150 documentos/mês",
      features: ["Assinatura digital", "Suporte prioritário", "3 usuários", "API Access"],
      popular: false,
    },
    {
      name: "Angico",
      price: "R$ 349,00",
      documents: "500 documentos/mês",
      features: ["Tudo do Jatobá", "5 usuários", "Integração avançada", "Relatórios"],
      popular: true,
    },
    {
      name: "Aroeira",
      price: "R$ 599,00",
      documents: "1.000 documentos/mês",
      features: ["Tudo do Angico", "10 usuários", "Suporte 24/7", "White label"],
      popular: false,
    },
    {
      name: "Peroba",
      price: "R$ 999,00",
      documents: "2.500 documentos/mês",
      features: ["Tudo do Aroeira", "20 usuários", "Gerente dedicado", "SLA garantido"],
      popular: false,
    },
    {
      name: "Pau-Brasil",
      price: "Sob consulta",
      documents: "Ilimitado",
      features: ["Tudo do Peroba", "Usuários ilimitados", "Customização total", "Infraestrutura dedicada"],
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Como funciona a assinatura digital?",
      answer: "A assinatura digital utiliza certificação ICP-Brasil para garantir a autenticidade e validade jurídica do documento.",
    },
    {
      question: "É juridicamente válido?",
      answer: "Sim! As assinaturas digitais têm a mesma validade jurídica que assinaturas manuscritas, conforme MP 2.200-2/2001.",
    },
    {
      question: "Quanto tempo leva para assinar?",
      answer: "Em média, menos de 1 minuto! Basta fazer upload, posicionar a assinatura e confirmar.",
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim, não há fidelidade. Você pode cancelar seu plano quando quiser.",
    },
    {
      question: "Como funciona o suporte?",
      answer: "Oferecemos suporte por email, chat e telefone conforme o plano contratado.",
    },
    {
      question: "Preciso de certificado digital?",
      answer: "Não necessariamente. Oferecemos opções com assinatura eletrônica simples e qualificada.",
    },
    {
      question: "Os documentos ficam salvos?",
      answer: "Sim, todos os documentos assinados ficam armazenados de forma segura em nossa nuvem.",
    },
    {
      question: "Posso integrar com meu sistema?",
      answer: "Sim! Oferecemos API REST completa para integração com seus sistemas.",
    },
    {
      question: "Há desconto para pagamento anual?",
      answer: "Sim! No pagamento anual você ganha 2 meses grátis.",
    },
    {
      question: "Como funciona o multi-tenant?",
      answer: "Cada empresa tem seu ambiente isolado e seguro, com gestão própria de usuários e documentos.",
    },
    {
      question: "Posso testar antes de assinar?",
      answer: "Sim! Oferecemos 7 dias de teste grátis em todos os planos.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">MDSign</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#como-funciona" className="text-sm font-medium hover:text-primary transition-colors">
              Como funciona
            </a>
            <a href="#planos" className="text-sm font-medium hover:text-primary transition-colors">
              Planos
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-mdsign-teal hover:bg-mdsign-teal/90">
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
                A solução completa de assinatura digital que sua empresa precisa.
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
      <section className="py-20 bg-secondary">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Por que escolher o MDSign?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <benefit.icon className="h-12 w-12 text-primary mb-2" />
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
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.documents}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    {plan.price !== "Sob consulta" && <span className="text-muted-foreground">/mês</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-mdsign-teal" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/auth" className="w-full">
                    <Button className="w-full bg-mdsign-orange hover:bg-mdsign-orange/90">
                      Começar Agora
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-8 w-8" />
                <span className="text-2xl font-bold">MDSign</span>
              </div>
              <p className="text-white/80">
                Assinatura digital sustentável e segura para sua empresa.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Contato</h3>
              <div className="space-y-2 text-white/80">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(61) 3003-0632</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(61) 99933-8061 (WhatsApp)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contato@signdocmd.com.br</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Seg-Sex: 08:00 às 20:00</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Redes Sociais</h3>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>&copy; {new Date().getFullYear()} MDSign. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
