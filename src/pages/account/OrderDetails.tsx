import { useRoute, Link } from 'wouter';
import { AccountLayout } from '@/components/AccountLayout';
import { ordersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Download, MessageSquare, ArrowLeft } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { useOrderDetailQuery } from '@/store/hooks';

export default function OrderDetails() {
  const { formatPrice } = useCurrency();
  const [, params] = useRoute('/account/orders/:id');
  const { data: order, isLoading } = useOrderDetailQuery(params?.id);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    try {
      await ordersAPI.downloadInvoice(order.id);
    } catch (error) {
      toast.error('Unable to download invoice');
    }
  };

  const handleContactSupport = () => {
    if (!order) return;
    window.location.href = `/account/support?order=${order.id}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-500/10 text-green-500';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-500';
      case 'processing':
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <AccountLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </AccountLayout>
    );
  }

  if (!order) {
    return (
      <AccountLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order not found.</p>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <Link href="/account/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Order #{order.id}</h1>
              <p className="text-muted-foreground mt-2">
                Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Pending'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full" onClick={handleDownloadInvoice}>
                <Download className="h-4 w-4 mr-2" />
                Invoice
              </Button>
              <Button variant="outline" className="rounded-full" onClick={handleContactSupport}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Support
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Order Status</p>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            {order.trackingNumber && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Tracking Number</p>
                <p className="font-mono font-semibold text-foreground">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={`${item.productId}-${item.name}`} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="h-20 w-20 rounded-2xl bg-secondary overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-full w-full p-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatPrice(item.price)}</p>
                      <p className="text-sm text-muted-foreground mt-1">each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(order.summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{formatPrice(order.summary.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">{formatPrice(order.summary.tax)}</span>
                </div>
                {order.summary.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.summary.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(order.summary.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Shipping Address</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ''}
                </p>
                {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                {order.shippingAddress.phone && <p className="pt-2">{order.shippingAddress.phone}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
