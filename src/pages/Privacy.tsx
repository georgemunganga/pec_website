import { APP_TITLE } from '@/const';

export default function Privacy() {
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent/20 to-secondary/30 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
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
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                {APP_TITLE} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you visit our website 
                and use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
              <p className="leading-relaxed mb-3">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address</li>
                <li><strong>Payment Information:</strong> Payment method details (processed securely through our payment partners)</li>
                <li><strong>Order Information:</strong> Products purchased, order history, preferences</li>
                <li><strong>Communication Data:</strong> Your messages, feedback, and customer service interactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and our services</li>
                <li>Provide customer support</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our products and services</li>
                <li>Detect and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Information Sharing</h2>
              <p className="leading-relaxed mb-3">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> Third parties who help us operate our business (e.g., payment processors, shipping companies)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
              </ul>
              <p className="leading-relaxed mt-3">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Cookies and Tracking</h2>
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze site 
                traffic, and understand where our visitors are coming from. You can control cookies through your 
                browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Your Rights</h2>
              <p className="leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Object to processing of your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Children's Privacy</h2>
              <p className="leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-3 pl-4 border-l-2 border-primary">
                <p>Email: privacy@pureessenceapothecary.com</p>
                <p>Phone: +26097 7883578</p>
                <p>Address: 123 Beauty Street, Cosmetics District, City, Country 12345</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
