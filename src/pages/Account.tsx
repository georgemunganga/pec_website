import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Account() {
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="max-w-2xl">
          <div className="bg-card rounded-lg p-8 shadow-sm text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Account Features Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              We're working on bringing you a complete account management experience. 
              Soon you'll be able to view your orders, manage your profile, and track your purchases.
            </p>
            <Button onClick={() => window.location.href = '/shop'}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
