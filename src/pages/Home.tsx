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
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] lg:min-h-[700px]">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center items-start text-left px-8 py-16 lg:py-20">
            <div className="max-w-lg w-full">
              <span className="text-sm text-muted-foreground uppercase tracking-wider mb-6 block">
                Natural magic
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-8 leading-tight">
                Start your Glow Journey Today. 
              </h1>
              
              {/* Description with italic */}
              <div className="mb-12">
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  Say goodbye to looking dull with a glow so soft and natural, people notice you, not your skin problems.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right: Product Visual */}
          <div className="relative bg-secondary/20 overflow-hidden">
            <picture>
              <source
                srcSet="/assets/hero/hero-glow.avif"
                type="image/avif"
              />
              <source
                srcSet="/assets/hero/hero-glow-2400.webp 2400w, /assets/hero/hero-glow-1200.webp 1200w"
                type="image/webp"
              />
              <img
                src="/assets/hero/hero-glow-1200.webp"
                srcSet="/assets/hero/hero-glow-2400.webp 2400w, /assets/hero/hero-glow-1200.webp 1200w"
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt="Featured Product"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                fetchpriority="high"
              />
            </picture>
          </div>
        </div>
        {/* CTA anchored bottom-left of hero */}
        <Link
          href="/shop"
          className="absolute left-4 bottom-6 md:left-10 md:bottom-10"
        >
          <Button
            size="lg"
            className="rounded-full gap-3 pl-6 pr-2 py-3 bg-[#8b572a] hover:bg-[#774723] text-white shadow-md transition-all flex items-center"
          >
            <span className="text-base font-medium">Shop the Collection</span>
            <span className="w-9 h-9 rounded-full bg-white text-[#8b572a] flex items-center justify-center shadow-sm">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </Button>
        </Link>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <section className="py-16 md:py-20 bg-secondary/30">
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
