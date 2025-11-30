import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { APP_TITLE } from '@/const';

export default function Location() {
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent/20 to-secondary/30 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            We Are Located At
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Visit our store or reach out to us
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Map Placeholder */}
          <div>
            <div className="bg-secondary/30 rounded-lg overflow-hidden aspect-video md:aspect-square flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">
                  Interactive map will be displayed here
                </p>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Visit Our Store</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Address</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {APP_TITLE} Store<br />
                      123 Beauty Street<br />
                      Cosmetics District<br />
                      City, Country 12345
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Opening Hours</h3>
                    <div className="space-y-1 text-muted-foreground">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Phone</h3>
                    <p className="text-muted-foreground">+26097 7883578</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-muted-foreground">info@pureessenceapothecary.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-3">How to Find Us</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We're located in the heart of the Cosmetics District, easily accessible 
                by public transport and with ample parking available nearby. Look for our 
                signature burgundy storefront!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
