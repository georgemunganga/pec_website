import { Link, useLocation } from 'wouter';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export function MobileNav() {
  const [location] = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/shop', icon: ShoppingBag, label: 'Shop' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { href: '/account', icon: User, label: 'Account' },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border shadow-lg"
      aria-label="Primary mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2" role="menubar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 px-3 py-2 rounded-2xl transition-all min-w-[60px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              role="menuitem"
            >
              <div className="relative flex items-center justify-center" aria-hidden="true">
                <Icon className="w-6 h-6" />
                {item.badge && item.badge > 0 && (
                  <>
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                    <span className="sr-only">{item.badge} items in cart</span>
                  </>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
