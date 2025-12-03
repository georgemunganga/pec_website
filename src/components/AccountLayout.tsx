import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  User, 
  MapPin, 
  Heart, 
  RotateCcw, 
  HelpCircle,
  LogOut,
  Bell
} from 'lucide-react';
import { Button } from './ui/button';

interface AccountLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { name: 'My Orders', href: '/account/orders', icon: Package },
  { name: 'Profile', href: '/account/profile', icon: User },
  { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { name: 'Notifications', href: '/account/notifications', icon: Bell },
  { name: 'Returns', href: '/account/returns', icon: RotateCcw },
  { name: 'Support', href: '/account/support', icon: HelpCircle },
];

export function AccountLayout({ children }: AccountLayoutProps) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pb-20 md:pb-8">
        {/* Mobile Header - App-like */}
        <div className="md:hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-6 rounded-b-[2rem]">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <span className="text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Welcome back!</h1>
              <p className="text-sm text-primary-foreground/80">{user?.name || 'User'}</p>
            </div>
          </div>

          {/* Mobile Quick Actions */}
          <div className="grid grid-cols-4 gap-2">
            {navigation.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <button
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-white/30 backdrop-blur-sm'
                        : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.name.split(' ')[0]}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="container py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="bg-card rounded-3xl p-6 border border-border sticky top-8 shadow-sm">
                {/* User Info */}
                <div className="mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                      <span className="text-xl font-bold">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-3">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    
                    return (
                      <Link key={item.name} href={item.href}>
                        <a
                          className={`flex w-full items-center gap-3 px-5 py-3.5 my-1 rounded-full transition-all ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                        </a>
                      </Link>
                    );
                  })}

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 py-3 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </Button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              <div className="space-y-4">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileNav />
    </div>
  );
}
