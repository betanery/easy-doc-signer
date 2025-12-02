import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Bell, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  timestamp: Date;
  documentId?: string;
}

export const DocumentNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Subscribe to realtime changes on documents_cache
    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents_cache'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          handleDocumentChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDocumentChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    let notification: Notification | null = null;

    switch (eventType) {
      case 'INSERT':
        notification = {
          id: crypto.randomUUID(),
          title: 'Novo documento criado',
          message: `Documento ${newRecord.lacuna_document_id} foi criado com sucesso`,
          type: 'success',
          timestamp: new Date(),
          documentId: newRecord.lacuna_document_id
        };
        toast({
          title: notification.title,
          description: notification.message,
          duration: 5000,
        });
        break;

      case 'UPDATE':
        const oldData = oldRecord.document_data as any;
        const newData = newRecord.document_data as any;
        
        if (oldData.status !== newData.status) {
          const statusMessages: Record<string, { title: string; type: 'success' | 'warning' | 'info' }> = {
            'Pending': { title: 'Aguardando assinaturas', type: 'info' },
            'InProgress': { title: 'Assinatura em andamento', type: 'info' },
            'Completed': { title: 'Documento concluído', type: 'success' },
            'Cancelled': { title: 'Documento cancelado', type: 'warning' },
          };

          const statusInfo = statusMessages[newData.status] || { 
            title: 'Status atualizado', 
            type: 'info' as const 
          };

          notification = {
            id: crypto.randomUUID(),
            title: statusInfo.title,
            message: `Documento ${newRecord.lacuna_document_id} mudou para: ${newData.status}`,
            type: statusInfo.type,
            timestamp: new Date(),
            documentId: newRecord.lacuna_document_id
          };

          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
          });
        }
        break;

      case 'DELETE':
        notification = {
          id: crypto.randomUUID(),
          title: 'Documento excluído',
          message: `Documento ${oldRecord.lacuna_document_id} foi removido`,
          type: 'warning',
          timestamp: new Date(),
        };
        toast({
          title: notification.title,
          description: notification.message,
          duration: 5000,
        });
        break;
    }

    if (notification) {
      setNotifications(prev => [notification!, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-status-success" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-status-warning" />;
      default:
        return <Clock className="w-4 h-4 text-status-info" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'Agora';
  };

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) markAsRead();
    }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications([])}
            >
              Limpar tudo
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação ainda
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
