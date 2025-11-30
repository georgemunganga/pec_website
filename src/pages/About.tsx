import { APP_TITLE } from '@/const';
import { SEO } from '@/components/SEO';

export default function About() {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about Pure Essence Apothecary - your trusted partner in beauty and skincare. Discover our story, values, and commitment to quality."
        keywords="about, Pure Essence Apothecary, beauty, skincare, company story"
      />
      <div className="min-h-screen pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent/20 to-secondary/30 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            About {APP_TITLE}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Your trusted partner in beauty and skincare
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Our Story */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                {APP_TITLE} was founded with a simple mission: to provide high-quality, 
                premium cosmetics and skincare products that enhance natural beauty. We believe 
                that everyone deserves to feel confident and beautiful in their own skin.
              </p>
              <p>
                Our carefully curated collection features products made with the finest ingredients, 
                combining traditional beauty wisdom with modern scientific innovation. Each product 
                is selected for its quality, effectiveness, and commitment to your skin's health.
              </p>
            </div>
          </section>

          {/* Our Values */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Quality First</h3>
                <p className="text-muted-foreground">
                  We never compromise on quality. Every product in our collection meets 
                  the highest standards of excellence and safety.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Customer Care</h3>
                <p className="text-muted-foreground">
                  Your satisfaction is our priority. We're here to help you find the 
                  perfect products for your unique beauty needs.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Transparency</h3>
                <p className="text-muted-foreground">
                  We believe in honest communication about our products, ingredients, 
                  and practices. No hidden surprises.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
                <p className="text-muted-foreground">
                  We're committed to environmentally responsible practices and 
                  sustainable sourcing whenever possible.
                </p>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Choose Us</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Premium Quality:</strong> Only the finest ingredients and formulations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Wide Selection:</strong> Comprehensive range of cosmetics and skincare products</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Expert Curation:</strong> Each product carefully selected by beauty professionals</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Fast Delivery:</strong> Quick and reliable shipping to your doorstep</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong>Customer Support:</strong> Dedicated team ready to assist you</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}
