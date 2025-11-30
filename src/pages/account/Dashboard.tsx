import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { AccountLayout } from '@/components/AccountLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistAPI, addressesAPI } from '@/services/api';
import { Package, User, MapPin, Heart, TrendingUp, ChevronRight, Clock } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useUserProfileQuery, useOrdersQuery } from '@/store/hooks';
import { OrdersListSkeleton, StatCardSkeleton } from '@/components/skeletons/AccountSkeleton';
import { formatDate } from '@/lib/format';

export default function Dashboard() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { data: profileData, isLoading: isProfileLoading } = useUserProfileQuery();
  const { data: orders = [], isLoading: isOrdersLoading } = useOrdersQuery();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [wishlistRes, addressesRes] = await Promise.all([
          wishlistAPI.getWishlist().catch(() => []),
          addressesAPI.getAddresses().catch(() => []),
        ]);

        const wishlistItems = Array.isArray(wishlistRes?.items)
          ? wishlistRes.items
          : Array.isArray(wishlistRes?.data)
          ? wishlistRes.data
          : Array.isArray(wishlistRes)
          ? wishlistRes
          : [];
        setWishlistCount(wishlistItems.length);

        const addresses =
          Array.isArray(addressesRes?.data?.addresses)
            ? addressesRes.data.addresses
            : Array.isArray(addressesRes?.data)
            ? addressesRes.data
            : Array.isArray(addressesRes)
            ? addressesRes
            : [];
        setAddressCount(addresses.length);
      } catch {
        setWishlistCount(0);
        setAddressCount(0);
      }
    };

    loadCounts();
  }, []);

  const profile = profileData || {};
  const recentOrders = orders.slice(0, 3);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, gradient: 'from-primary/20 to-primary/10' },
    { label: 'Loyalty Points', value: profile?.loyaltyPoints || 0, icon: TrendingUp, gradient: 'from-secondary/20 to-secondary/10' },
    { label: 'Wishlist', value: wishlistCount, icon: Heart, gradient: 'from-pink-500/20 to-pink-500/10' },
    { label: 'Addresses', value: addressCount, icon: MapPin, gradient: 'from-purple-500/20 to-purple-500/10' },
  ];

  const quickActions = [
    { label: 'My Orders', href: '/account/orders', icon: Package, color: 'text-primary' },
    { label: 'Edit Profile', href: '/account/profile', icon: User, color: 'text-secondary' },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart, color: 'text-pink-500' },
  ];

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered': return 'bg-green-500/10 text-green-700';
      case 'shipped': return 'bg-blue-500/10 text-blue-700';
      case 'processing': return 'bg-secondary/20 text-secondary-foreground';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your orders, profile, and preferences
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {isProfileLoading
            ? Array.from({ length: 4 }).map((_, idx) => <StatCardSkeleton key={`stat-skeleton-${idx}`} />)
            : stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`bg-gradient-to-br ${stat.gradient} rounded-2xl md:rounded-3xl p-4 md:p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-foreground/70" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                );
              })}
        </div>

        <div className="bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 border border-border shadow-sm">
          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}>
                  <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full bg-background flex items-center justify-center ${action.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-foreground">{action.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-foreground">Recent Orders</h2>
            <Link href="/account/orders">
              <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                View All
                <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {isOrdersLoading ? (
            <OrdersListSkeleton />
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No orders yet</p>
              <Link href="/shop">
                <Button className="mt-4 rounded-full">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all group cursor-pointer">
                    <div className="h-16 w-16 rounded-xl bg-background flex items-center justify-center overflow-hidden flex-shrink-0">
                      {order.items[0]?.image ? (
                        <img src={order.items[0].image} alt={order.items[0].name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-foreground truncate">Order #{order.id}</p>
                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">{formatPrice(order.total)}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl md:rounded-3xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Loyalty Rewards</h3>
              <p className="text-sm text-primary-foreground/80 mt-1">You have {profile?.loyaltyPoints || 0} points</p>
            </div>
            <TrendingUp className="h-8 w-8" />
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full h-2 mb-4">
            <div className="bg-white h-2 rounded-full" style={{ width: `${Math.min(100, (profile?.loyaltyPoints || 0) / 5)}%` }}></div>
          </div>
          <p className="text-sm text-primary-foreground/90">
            Earn more points to unlock your next reward!
          </p>
        </div>
      </div>
    </AccountLayout>
  );
}
