import { useState } from 'react';
import { Link } from 'wouter';
import { AccountLayout } from '@/components/AccountLayout';
import { Package, Search } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Input } from '@/components/ui/input';
import { useOrdersQuery } from '@/store/hooks';
import { OrdersListSkeleton } from '@/components/skeletons/AccountSkeleton';
import { formatDate } from '@/lib/format';

export default function Orders() {
  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: orders = [], isLoading } = useOrdersQuery();

  const filteredOrders = orders.filter(order => {
    const term = searchTerm.trim().toLowerCase();
    return (
      !term ||
      order.id?.toLowerCase().includes(term) ||
      order.status?.toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status: string) => {
    const value = status?.toLowerCase();
    switch (value) {
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

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-2">View and track your orders</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 rounded-full"
          />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <OrdersListSkeleton />
          ) : filteredOrders.length === 0 ? (
            <div className="bg-card rounded-3xl p-12 border border-border text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try a different search term' : 'Start shopping to see your orders here'}
              </p>
              <Link href="/shop">
                <a className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors">
                  Browse Products
                </a>
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}>
                <div className="bg-card rounded-3xl p-6 border border-border hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">Order #{order.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} • Placed on {formatDate(order.createdAt)}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Tracking: <span className="font-mono">{order.trackingNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{formatPrice(order.total)}</p>
                      {order.estimatedDelivery && (
                        <p className="text-xs text-muted-foreground">Est. delivery {formatDate(order.estimatedDelivery)}</p>
                      )}
                      <p className="text-sm text-primary mt-1">View details →</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
