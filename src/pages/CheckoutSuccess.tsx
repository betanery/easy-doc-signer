import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function CheckoutSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success('Assinatura realizada com sucesso!');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          <div className="w-20 h-20 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-status-success" />
          </div>
          <CardTitle className="text-2xl text-status-success">Pagamento confirmado!</CardTitle>
          <CardDescription className="text-base">
            Sua assinatura foi ativada com sucesso. Você já pode aproveitar todos os recursos do seu plano.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>Um e-mail de confirmação foi enviado para você com os detalhes da sua assinatura.</p>
          </div>
          <Button 
            className="w-full" 
            onClick={() => navigate('/dashboard')}
          >
            Ir para o Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/documents/upload')}
          >
            Enviar meu primeiro documento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
