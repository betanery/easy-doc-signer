import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          <div className="w-20 h-20 rounded-full bg-status-warning/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-status-warning" />
          </div>
          <CardTitle className="text-2xl">Pagamento cancelado</CardTitle>
          <CardDescription className="text-base">
            Você cancelou o processo de pagamento. Não se preocupe, nenhuma cobrança foi realizada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>Se você tiver alguma dúvida sobre nossos planos ou precisar de ajuda, nossa equipe está à disposição.</p>
          </div>
          <Button 
            className="w-full" 
            onClick={() => navigate('/planos')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos planos
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.open('https://wa.me/5561999338061?text=Olá! Preciso de ajuda com a assinatura.', '_blank')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Falar com suporte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
