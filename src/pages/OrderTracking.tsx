import { useMemo, useState } from 'react';
import { Package, Phone, Search, Mail, MapPin, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { ordersAPI, type TrackOrderParams } from '@/services/api';

type ContactMethod = 'email' | 'phone';

interface TrackingEvent {
  status: string;
  timestamp?: string;
  location?: string;
  message?: string;
}

interface TrackingInfo {
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  status: string;
  estimatedDelivery?: string;
  timeline: TrackingEvent[];
}

const normalizeTrackingInfo = (payload: any): TrackingInfo => {
  const data = payload?.data || payload || {};
  const timelineSource =
    data.timeline ||
    data.events ||
    data.history ||
    data.tracking?.timeline ||
    data.tracking?.events ||
    [];

  return {
    orderId: data.orderId || data.id || data.order || 'Unknown',
    trackingNumber: data.trackingNumber || data.tracking?.number,
    carrier: data.carrier || data.tracking?.carrier,
    status: data.status || data.tracking?.status || 'pending',
    estimatedDelivery: data.estimatedDelivery || data.tracking?.estimatedDelivery,
    timeline: Array.isArray(timelineSource)
      ? timelineSource.map((event: any) => ({
          status: event.status || event.label || 'update',
          timestamp: event.timestamp || event.time || event.date,
          location: event.location || event.place,
          message: event.message || event.description,
        }))
      : [],
  };
};

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [contactValue, setContactValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const contactLabel = contactMethod === 'email' ? 'Email Address *' : 'Phone Number *';
  const contactPlaceholder =
    contactMethod === 'email' ? 'your.email@example.com' : '+260 97 123 4567';

  const contactIcon = contactMethod === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />;

  const timeline = useMemo(() => trackingInfo?.timeline || [], [trackingInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      toast.error('Please enter your order number.');
      return;
    }

    if (!contactValue.trim()) {
      toast.error(`Please enter your ${contactMethod === 'email' ? 'email address' : 'phone number'}.`);
      return;
    }

    setIsSearching(true);
    setTrackingInfo(null);
    setErrorMessage(null);

    const payload: TrackOrderParams = {
      orderNumber: orderNumber.trim(),
      email: contactMethod === 'email' ? contactValue.trim() : undefined,
      phone: contactMethod === 'phone' ? contactValue.trim() : undefined,
    };

    try {
      const response = await ordersAPI.trackOrder(payload);
      const normalized = normalizeTrackingInfo(response);
      setTrackingInfo(normalized);
      toast.success('Tracking details updated.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not find tracking information for the provided details.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSearching(false);
    }
  };

  const renderTimeline = () => {
    if (!timeline.length) {
      return (
        <p className="text-sm text-muted-foreground">
          No tracking events yet. Please check back later or contact support if your package is delayed.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {timeline.map((event, index) => (
          <div key={`${event.status}-${event.timestamp}-${index}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-primary" />
              {index < timeline.length - 1 && <div className="flex-1 w-px bg-border mt-1" />}
            </div>
            <div className="flex-1 pb-4 border-b border-border last:border-0 last:pb-0">
              <p className="font-semibold text-foreground">{event.status}</p>
              {(event.location || event.message) && (
                <p className="text-sm text-muted-foreground">
                  {event.location}
                  {event.location && event.message ? ' • ' : ''}
                  {event.message}
                </p>
              )}
              {event.timestamp && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
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
          <div className="bg-card rounded-lg p-8 shadow-sm space-y-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Track Your Package</h2>
                  <p className="text-sm text-muted-foreground">
                    Use your order number with either your email or phone number to find the latest status.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number *</Label>
                  <Input
                    id="orderNumber"
                    type="text"
                    placeholder="e.g., PE2LCHLRO"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can find your order number in the confirmation email or SMS receipt.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Contact Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={contactMethod === 'email' ? 'default' : 'outline'}
                      className="w-full rounded-full"
                      onClick={() => setContactMethod('email')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={contactMethod === 'phone' ? 'default' : 'outline'}
                      className="w-full rounded-full"
                      onClick={() => setContactMethod('phone')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Phone
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">{contactLabel}</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {contactIcon}
                      </div>
                      <Input
                        id="contact"
                        type={contactMethod === 'email' ? 'email' : 'tel'}
                        className="pl-10"
                        placeholder={contactPlaceholder}
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {contactMethod === 'email'
                        ? 'Use the same email address you used to place the order.'
                        : 'Include your country code for faster lookup (e.g., +260...).'}
                    </p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {errorMessage}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full gap-2 rounded-full" disabled={isSearching}>
                  <Search className="w-5 h-5" />
                  {isSearching ? 'Searching...' : 'Track Order'}
                </Button>
              </form>
            </div>

            {trackingInfo && (
              <div className="space-y-6">
                <div className="bg-secondary/30 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order</p>
                      <p className="text-2xl font-bold text-foreground">#{trackingInfo.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-xl font-semibold capitalize">{trackingInfo.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tracking Number</p>
                      <p className="text-base font-medium font-mono">{trackingInfo.trackingNumber || 'Pending'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Carrier</p>
                      <p className="text-base font-medium">{trackingInfo.carrier || 'TBD'}</p>
                    </div>
                  </div>
                  {trackingInfo.estimatedDelivery && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="w-4 h-4 text-primary" />
                      Estimated delivery:{' '}
                      <span className="font-medium text-foreground">
                        {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="text-lg font-semibold">Tracking Timeline</h3>
                  </div>
                  {renderTimeline()}
                </div>
              </div>
            )}
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
