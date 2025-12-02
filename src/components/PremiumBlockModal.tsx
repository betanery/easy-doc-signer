import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumBlockModalProps {
  open: boolean;
  onClose: () => void;
  planType: 'FREE_TRIAL' | 'MONTHLY' | string;
}

const PremiumBlockModal = ({ open, onClose, planType }: PremiumBlockModalProps) => {
  const navigate = useNavigate();

  const isFreeTrial = planType === 'FREE_TRIAL';

  const title = 'Seu limite foi atingido';
  const subtitle = 'Para continuar enviando documentos, assine um dos nossos planos.';

  const planMessage = isFreeTrial
    ? 'Você já utilizou os seus 5 envios gratuitos. Escolha um plano para continuar assinando documentos com segurança e agilidade.'
    : 'Você atingiu o limite mensal de 20 documentos do plano Jacarandá. Faça upgrade para aproveitar documentos ilimitados.';

  const handleViewPlans = () => {
    onClose();
    navigate('/planos');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#112145] to-[#1a3266] border-none text-white">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#CEA32A] to-[#E5B82A] flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-gray-200 text-center leading-relaxed">
              {planMessage}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
          >
            Fechar
          </Button>
          <Button
            onClick={handleViewPlans}
            className="bg-gradient-to-r from-[#CEA32A] to-[#E5B82A] hover:from-[#D4A72E] hover:to-[#EABD30] text-white font-semibold shadow-lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Ver planos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumBlockModal;
