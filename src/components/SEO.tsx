import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
}

const DEFAULT_SEO = {
  title: 'Pure Essence Apothecary - Premium Natural Beauty & Skincare',
  description: 'Discover our collection of premium quality makeup and skincare products. Natural ingredients, cruelty-free, and carefully curated for your beauty needs.',
  keywords: 'makeup, skincare, beauty, cosmetics, natural beauty, organic skincare, premium cosmetics',
  image: '/logo.svg',
  type: 'website' as const,
  url: 'https://pureessenceapothecary.com'
};

export function SEO({
  title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  image = DEFAULT_SEO.image,
  type = DEFAULT_SEO.type,
  author = 'Pure Essence Apothecary'
}: SEOProps) {
  const [location] = useLocation();

  const fullTitle = title
    ? `${title} | Pure Essence Apothecary`
    : DEFAULT_SEO.title;

  const currentUrl = `${DEFAULT_SEO.url}${location}`;

  useEffect(() => {
    // Update page title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', 'Pure Essence Apothecary', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Additional meta tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

  }, [fullTitle, description, keywords, image, type, author, currentUrl]);

  return null;
}
