import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ManageSubscriptionButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function ManageSubscriptionButton({ variant = 'outline', className }: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        toast.error('Erro ao acessar portal de assinatura');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Erro ao acessar portal. Verifique se você possui uma assinatura ativa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleManageSubscription}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Abrindo...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Gerenciar assinatura
        </>
      )}
    </Button>
  );
}
