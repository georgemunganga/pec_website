import { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber || !email) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSearching(false);

    toast.info('Order tracking feature is coming soon. You will receive tracking updates via email.');
  };

  return (
    <>
      <SEO
        title="Track Your Order"
        description="Track your Pure Essence Apothecary order. Enter your order number and email to get real-time updates on your delivery."
        keywords="order tracking, track order, delivery status, order status"
      />
      <div className="min-h-screen pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent/20 to-secondary/30 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Enter your order details to track your shipment
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">Track Your Package</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number *</Label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="e.g., ORD-12345-ABCD"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You can find your order number in the confirmation email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The email address used when placing the order
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={isSearching}>
                <Search className="w-5 h-5" />
                {isSearching ? 'Searching...' : 'Track Order'}
              </Button>
            </form>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-secondary/30 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Can't find your order number?</strong><br />
                Check your email inbox for the order confirmation we sent you.
              </p>
              <p>
                <strong>Still having trouble?</strong><br />
                Contact our support team at <a href="mailto:support@pureessenceapothecary.com" className="text-primary hover:underline">support@pureessenceapothecary.com</a> or 
                call us at <a href="tel:+00123456789" className="text-primary hover:underline">+26097 7883578</a>
              </p>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="mt-8 space-y-4">
            <h3 className="font-semibold text-lg">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <h4 className="font-medium mb-2">Standard Shipping</h4>
                <p className="text-sm text-muted-foreground">3-5 business days</p>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <h4 className="font-medium mb-2">Express Shipping</h4>
                <p className="text-sm text-muted-foreground">1-2 business days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
