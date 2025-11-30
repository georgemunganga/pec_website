import { APP_TITLE } from '@/const';
import { RotateCcw, Package, Clock, CheckCircle } from 'lucide-react';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent/20 to-secondary/30 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Return Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            We want you to be completely satisfied with your purchase
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <Clock className="w-10 h-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">30-Day Returns</h3>
              <p className="text-sm text-muted-foreground">
                Return within 30 days of purchase
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <Package className="w-10 h-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Free Returns</h3>
              <p className="text-sm text-muted-foreground">
                No restocking fees on eligible items
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <RotateCcw className="w-10 h-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Easy Process</h3>
              <p className="text-sm text-muted-foreground">
                Simple return procedure
              </p>
            </div>
          </div>

          {/* Detailed Policy */}
          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Return Eligibility</h2>
              <p className="leading-relaxed mb-3">
                To be eligible for a return, items must meet the following conditions:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Returned within 30 days of delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Unused and in original condition</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>In original packaging with all tags attached</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Accompanied by proof of purchase</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Non-Returnable Items</h2>
              <p className="leading-relaxed mb-3">
                For hygiene and safety reasons, the following items cannot be returned:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Opened or used cosmetics and skincare products</li>
                <li>Items marked as final sale</li>
                <li>Gift cards</li>
                <li>Downloadable products</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">How to Return</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Contact Us</h4>
                    <p className="text-sm">
                      Email us at returns@pureessenceapothecary.com or call +26097 7883578 to initiate your return
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Receive Return Authorization</h4>
                    <p className="text-sm">
                      We'll send you a return authorization number and shipping instructions
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Pack Your Items</h4>
                    <p className="text-sm">
                      Securely pack the items in their original packaging with all tags attached
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Ship Your Return</h4>
                    <p className="text-sm">
                      Send the package using the provided shipping label or your preferred carrier
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Refunds</h2>
              <p className="leading-relaxed mb-3">
                Once we receive and inspect your return, we will process your refund within 5-7 business days. 
                Refunds will be issued to the original payment method used for purchase.
              </p>
              <p className="leading-relaxed">
                Please note that it may take additional time for your bank or credit card company to process 
                and post the refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Exchanges</h2>
              <p className="leading-relaxed">
                If you need to exchange an item for a different size, color, or product, please contact our 
                customer service team. We'll be happy to help you find the perfect replacement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Damaged or Defective Items</h2>
              <p className="leading-relaxed">
                If you receive a damaged or defective item, please contact us immediately at support@pureessenceapothecary.com 
                with photos of the damage. We will arrange for a replacement or full refund at no cost to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="leading-relaxed mb-3">
                For questions about returns or to initiate a return, please contact:
              </p>
              <div className="bg-secondary/30 rounded-lg p-6">
                <p><strong>Email:</strong> returns@pureessenceapothecary.com</p>
                <p><strong>Phone:</strong> +26097 7883578</p>
                <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
