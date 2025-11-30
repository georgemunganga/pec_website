import { APP_TITLE, APP_LOGO } from '@/const';
import { CONTACT_INFO } from '@/const/contact';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-36 md:h-36 w-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4 pr-4">
              Premium quality makeup and skincare products for your beauty needs.
              Discover our collection of carefully curated cosmetics.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary/50 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary/50 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary/50 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary/50 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                aria-label="Subscribe on YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Shop
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/location" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Location
                </a>
              </li>
              <li>
                <a href="/order-tracking" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Order Tracking
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/return-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Return Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">
                Phone: {CONTACT_INFO.phone}
              </li>
              <li className="text-sm text-muted-foreground">
                Email: {CONTACT_INFO.email}
              </li>
              <li className="text-sm text-muted-foreground">
                {CONTACT_INFO.fullAddress}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_TITLE}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
