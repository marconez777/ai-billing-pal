import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Payment } from '@/lib/types';

interface ApprovePaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (paymentId: string, data: { extendDays: number; notes?: string }) => void;
  onReject: (paymentId: string, reason: string) => void;
}

export const ApprovePaymentDialog = ({
  payment,
  open,
  onOpenChange,
  onApprove,
  onReject
}: ApprovePaymentDialogProps) => {
  const [extendDays, setExtendDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = () => {
    if (payment) {
      onApprove(payment.id, { extendDays, notes });
      onOpenChange(false);
      setAction(null);
    }
  };

  const handleReject = () => {
    if (payment && rejectionReason.trim()) {
      onReject(payment.id, rejectionReason);
      onOpenChange(false);
      setAction(null);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {action === 'reject' ? 'Rejeitar Pagamento' : 'Aprovar Pagamento'}
          </DialogTitle>
          <DialogDescription>
            Pagamento de R$ {payment.amount.toFixed(2)} - ID: {payment.id}
          </DialogDescription>
        </DialogHeader>

        {action === 'reject' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Motivo da Rejeição</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="extendDays">Estender Assinatura (dias)</Label>
              <Input
                id="extendDays"
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 30)}
                min="1"
                max="365"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre este pagamento..."
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {!action ? (
            <>
              <Button variant="outline" onClick={() => setAction('reject')}>
                Rejeitar
              </Button>
              <Button onClick={() => setAction('approve')}>
                Aprovar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setAction(null)}>
                Voltar
              </Button>
              {action === 'reject' ? (
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                >
                  Confirmar Rejeição
                </Button>
              ) : (
                <Button onClick={handleApprove}>
                  Confirmar Aprovação
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};