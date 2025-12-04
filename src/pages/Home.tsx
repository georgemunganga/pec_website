import { Link } from 'wouter';
import { ArrowRight, ArrowUpRight, Sparkles, Truck, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { APP_TITLE } from '@/const';
import { SEO } from '@/components/SEO';
import { Newsletter } from '@/components/Newsletter';
import { StructuredData, generateOrganizationSchema, generateWebSiteSchema } from '@/components/StructuredData';
import { useFeaturedProductsQuery } from '@/store/hooks';

export default function Home() {
  const {
    data: featuredProducts = [],
    isLoading: loadingFeatured,
    error: featuredError,
  } = useFeaturedProductsQuery();

  return (
    <>
      <SEO />
      <StructuredData data={generateOrganizationSchema()} />
      <StructuredData data={generateWebSiteSchema()} />
      <div className="min-h-screen pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="relative bg-background overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[380px] md:min-h-[540px] lg:min-h-[340px]">
          {/* Left: Text Content */}
          <div className="flex flex-col h-full px-6 py-8 lg:px-12 lg:py-10">
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-[0.2em] mb-6">
                Nature's Kiss
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-tight">
                Start your Glow Journey Today.
              </h1>
            </div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
              <div className="text-xs md:text-sm text-muted-foreground italic text-center sm:text-right order-1 sm:order-2 sm:max-w-md sm:flex-1 sm:pl-6">
                Say goodbye to looking dull with a glow so soft and natural, people notice you, not your skin problems.
              </div>
              <div className="order-2 sm:order-1 flex justify-center sm:justify-start sm:flex-none">
                <Link href="/shop">
                  <Button
                    size="lg"
                    className="rounded-full gap-3 pl-6 pr-2 py-3 bg-[#662609] hover:bg-[#4f1d06] text-white shadow-md transition-all flex items-center"
                  >
                    <span className="text-base font-medium">Start shopping</span>
                    <span className="w-9 h-9 rounded-full bg-white text-[#662609] flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Product Visual */}
          <div className="relative bg-secondary/20 overflow-hidden">
            <img
              src="/assets/hero/hero-glow.webp"
              alt="Featured Product"
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wide mb-2 block">
              Best Sellers
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular products loved by customers worldwide
            </p>
          </div>

          {featuredError && (
            <p className="text-destructive text-center mb-6">
              {featuredError instanceof Error ? featuredError.message : 'Failed to load featured products'}
            </p>
          )}
          {loadingFeatured ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center mb-8">
              New products coming soon. Check back later!
            </p>
          )}

          <div className="text-center">
            <Link href="/shop">
              <Button variant="outline" size="lg" className="rounded-full gap-2 px-8 font-medium hover:scale-105 transition-all">
                View All Products
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      {/* Features Section */}
      <section className="py-16 md:py-20 pb-0 bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">
                Only the finest ingredients in every product
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Quick and reliable shipping to your doorstep
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartHandshake className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer Care</h3>
              <p className="text-muted-foreground">
                Dedicated support for all your beauty needs
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
