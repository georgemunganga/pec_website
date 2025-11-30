import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Thanks for subscribing! Check your email for confirmation.');
      setEmail('');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-secondary/20 border-y border-border py-12">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Subscribe to Our Newsletter
          </h3>
          <p className="text-muted-foreground mb-6">
            Get exclusive offers, beauty tips, and updates on new products delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              disabled={isLoading}
              aria-label="Email address"
              required
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="sm:w-auto"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
