import { APP_TITLE } from '@/const';

export default function Terms() {
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent/20 to-secondary/30 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto prose prose-slate">
          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing and using {APP_TITLE}'s website and services, you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Use of Our Service</h2>
              <p className="leading-relaxed mb-3">
                You agree to use our service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service in any way that violates any applicable law or regulation</li>
                <li>Engage in any conduct that restricts or inhibits anyone's use of the service</li>
                <li>Attempt to interfere with the proper working of the service</li>
                <li>Use any automated system to access the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Products and Services</h2>
              <p className="leading-relaxed">
                All products and services are subject to availability. We reserve the right to discontinue any 
                product at any time. Prices for our products are subject to change without notice. We reserve 
                the right to modify or discontinue the service (or any part thereof) without notice at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Orders and Payment</h2>
              <p className="leading-relaxed mb-3">
                By placing an order, you warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are legally capable of entering into binding contracts</li>
                <li>All information you provide is accurate and complete</li>
                <li>You will pay for all products ordered</li>
              </ul>
              <p className="leading-relaxed mt-3">
                We reserve the right to refuse or cancel any order for any reason, including but not limited to 
                product availability, errors in pricing or product information, or suspected fraudulent activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Shipping and Delivery</h2>
              <p className="leading-relaxed">
                We will make every effort to deliver products within the estimated timeframe. However, we are 
                not responsible for delays caused by circumstances beyond our control. Risk of loss and title 
                for products purchased pass to you upon delivery to the carrier.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Intellectual Property</h2>
              <p className="leading-relaxed">
                The service and its original content, features, and functionality are owned by {APP_TITLE} and 
                are protected by international copyright, trademark, patent, trade secret, and other intellectual 
                property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
              <p className="leading-relaxed">
                In no event shall {APP_TITLE}, nor its directors, employees, partners, agents, suppliers, or 
                affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes 
                a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Contact Information</h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-3 pl-4 border-l-2 border-primary">
                <p>Email: info@pureessenceapothecary.com</p>
                <p>Phone: +26097 7883578</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
