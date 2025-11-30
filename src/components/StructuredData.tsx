import { useEffect } from 'react';

export type StructuredDataType =
  | 'Product'
  | 'Organization'
  | 'WebSite'
  | 'BreadcrumbList'
  | 'LocalBusiness';

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    script.id = `structured-data-${Date.now()}`;

    // Append to head
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById(script.id);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [data]);

  return null; // This component doesn't render anything
}

// Helper functions to generate common schema types

export const generateProductSchema = (product: {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  brand?: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  'name': product.name,
  'description': product.description,
  'image': product.image.startsWith('http') ? product.image : `${window.location.origin}${product.image}`,
  'sku': `PEC-${product.id}`,
  'brand': product.brand ? {
    '@type': 'Brand',
    'name': product.brand
  } : undefined,
  'offers': {
    '@type': 'Offer',
    'url': `${window.location.origin}/product/${product.id}`,
    'priceCurrency': 'USD',
    'price': product.price.toFixed(2),
    'availability': product.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    'itemCondition': 'https://schema.org/NewCondition'
  },
  'aggregateRating': product.rating && product.reviewCount ? {
    '@type': 'AggregateRating',
    'ratingValue': product.rating,
    'reviewCount': product.reviewCount,
    'bestRating': 5,
    'worstRating': 1
  } : undefined,
  'category': product.category
});

export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': 'Pure Essence Apothecary',
  'url': window.location.origin,
  'logo': `${window.location.origin}/logo.png`,
  'description': 'Premium cosmetics and skincare products for your beauty routine',
  'sameAs': [
    'https://facebook.com/pureessenceapothecary',
    'https://instagram.com/pureessenceapothecary',
    'https://twitter.com/pureessenceapothecary'
  ],
  'contactPoint': {
    '@type': 'ContactPoint',
    'contactType': 'Customer Service',
    'email': 'support@pureessenceapothecary.com'
  }
});

export const generateWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': 'Pure Essence Apothecary',
  'url': window.location.origin,
  'description': 'Premium cosmetics and skincare products',
  'potentialAction': {
    '@type': 'SearchAction',
    'target': {
      '@type': 'EntryPoint',
      'urlTemplate': `${window.location.origin}/shop?search={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': items.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.name,
    'item': item.url.startsWith('http') ? item.url : `${window.location.origin}${item.url}`
  }))
});

export const generateLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  'name': 'Pure Essence Apothecary',
  'image': `${window.location.origin}/logo.png`,
  'url': window.location.origin,
  'telephone': '+1-555-ESSENCE',
  'priceRange': '$10 - $200',
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': '123 Beauty Lane',
    'addressLocality': 'Los Angeles',
    'addressRegion': 'CA',
    'postalCode': '90001',
    'addressCountry': 'US'
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': 34.0522,
    'longitude': -118.2437
  },
  'openingHoursSpecification': [
    {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      'opens': '09:00',
      'closes': '18:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': 'Saturday',
      'opens': '10:00',
      'closes': '16:00'
    }
  ],
  'sameAs': [
    'https://facebook.com/pureessenceapothecary',
    'https://instagram.com/pureessenceapothecary',
    'https://twitter.com/pureessenceapothecary'
  ]
});
