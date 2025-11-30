import { Link } from 'wouter';
import { ShoppingCart, User, Menu, Search } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/contexts/CartContext';
import { APP_TITLE, APP_LOGO } from '@/const';
import { useState } from 'react';
import SearchBar from './SearchBar';
import { MobileSearch } from './MobileSearch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';

export function Header() {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border py-6">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Mobile Menu & Search */}
            <div className="flex items-center gap-3 md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-14 h-14 border-border hover:bg-secondary/50"
                    aria-label="Open menu"
                  >
                    <Menu className="w-7 h-7" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[320px]">
                  <SheetHeader className="flex flex-row items-center justify-between border-b border-border">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <img src={APP_LOGO} alt={APP_TITLE} className="h-14 w-auto" />
                  </SheetHeader>
                  <nav className="flex-1 p-4 space-y-2">
                    {[
                      { href: '/', label: 'Home' },
                      { href: '/shop', label: 'Shop' },
                      { href: '/about', label: 'About' },
                      { href: '/contact', label: 'Contact' },
                      { href: '/account', label: 'Account' },
                    ].map((item) => (
                      <Link href={item.href} key={item.href}>
                        <SheetClose asChild>
                          <button
                            className="w-full text-left px-4 py-3 rounded-2xl hover:bg-secondary/50 transition-colors font-medium"
                          >
                            {item.label}
                          </button>
                        </SheetClose>
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-14 h-14 border-border hover:bg-secondary/50"
                onClick={() => setMobileSearchOpen(true)}
                aria-label="Search products"
              >
                <Search className="w-7 h-7" />
              </Button>
            </div>

            {/* Logo */}
            <Link href="/">
              <div className="flex items-center cursor-pointer gap-2">
                <img src={APP_LOGO} alt={APP_TITLE} className="h-36 md:h-26 w-auto" />
              </div>
            </Link>

            {/* Desktop Navigation & Search */}
            <div className="hidden md:flex items-center gap-6 flex-1 max-w-2xl mx-8">
              <nav className="flex items-center gap-6">
                <Link href="/">
                  <a className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                    Home
                  </a>
                </Link>
                <Link href="/shop">
                  <a className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                    Shop
                  </a>
                </Link>
                
                <Link href="/contact">
                  <a className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                    Contact
                  </a>
                </Link>
                <Link href="/order-tracking">
                  <a className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                    Track Order
                  </a>
                </Link>
              </nav>
              <div className="flex-1">
                <SearchBar />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Account Button - Mobile Icon */}
              <Link href="/account">
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden rounded-full w-14 h-14 border-border hover:bg-secondary/50"
                  aria-label="Account"
                >
                  <User className="w-7 h-7" />
                </Button>
              </Link>

              {/* Account Button - Desktop */}
              <Link href="/account">
                <Button variant="outline" className="hidden md:flex h-14 rounded-full gap-3 pl-5 pr-2 border-border hover:bg-secondary/50 text-base">
                  <span className="text-sm font-medium">Account</span>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                </Button>
              </Link>
              
              {/* Cart Button - Desktop: Pill Shape, Mobile: Icon Only */}
              <Link href="/cart">
                <Button variant="outline" className="h-14 rounded-full gap-3 p-1  border-border hover:bg-secondary/50 text-base" aria-label="Cart">
                  <span className="text-sm font-medium hidden md:inline">Cart</span>
                  <div className="relative w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-primary-foreground" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      <MobileSearch isOpen={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
    </>
  );
}
