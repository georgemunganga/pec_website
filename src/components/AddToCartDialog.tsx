import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddToCartDialogProps {
  open: boolean;
  productName?: string;
  quantity?: number;
  onContinue: () => void;
  onCheckout: () => void;
}

export function AddToCartDialog({
  open,
  productName,
  quantity = 1,
  onContinue,
  onCheckout,
}: AddToCartDialogProps) {
  const line = quantity > 1 && productName ? `${quantity} × ${productName}` : productName;

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) onContinue();
    }}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <DialogTitle>Added to cart</DialogTitle>
          <DialogDescription>
            {line ? `${line} is now in your cart.` : 'Item added to your cart.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={onContinue}>
            Continue shopping
          </Button>
          <Button className="flex-1" onClick={onCheckout}>
            Go to checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
