import type { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: '1',
    name: 'Oil-Free Liquid Foundation',
    category: 'Foundation',
    price: 12.00,
    originalPrice: 22.00,
    rating: 4.5,
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
      'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=800&q=80'
    ],
    description: 'Lightweight, oil-free liquid foundation that provides natural coverage for all skin types. Long-lasting formula keeps your skin looking fresh all day.',
    features: ['Oil-free formula', 'Long-lasting coverage', 'SPF 15 protection', 'Available in 12 shades'],
    inStock: true,
    badge: 'sale'
  },
  {
    id: '2',
    name: 'Full Coverage Liquid Foundation',
    category: 'Foundation',
    price: 18.00,
    originalPrice: 30.00,
    rating: 4.8,
    reviewCount: 256,
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80'
    ],
    description: 'Full coverage foundation for flawless complexion. Buildable formula that conceals imperfections while feeling lightweight.',
    features: ['Full coverage', 'Buildable formula', 'Matte finish', '24-hour wear'],
    inStock: true,
    badge: 'sale'
  },
  {
    id: '3',
    name: 'Ultra Dry Skin Moisturizer',
    category: 'Skincare',
    price: 18.00,
    originalPrice: 32.00,
    rating: 4.7,
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'
    ],
    description: 'Intensive hydration for very dry skin. Rich, nourishing formula that absorbs quickly without greasy residue.',
    features: ['Deep hydration', 'Non-greasy', 'Hyaluronic acid', 'Fragrance-free'],
    inStock: true,
    badge: 'sale'
  },
  {
    id: '4',
    name: 'Long Lasting Make Up Fixer',
    category: 'Makeup',
    price: 12.00,
    originalPrice: 22.00,
    rating: 4.6,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&q=80'
    ],
    description: 'Professional makeup setting spray that locks your look in place. Keeps makeup fresh and vibrant for up to 16 hours.',
    features: ['16-hour hold', 'Lightweight mist', 'Prevents smudging', 'Suitable for all skin types'],
    inStock: false,
    badge: 'sold-out'
  },
  {
    id: '5',
    name: 'Matte Finish Eyeliner',
    category: 'Eyes',
    price: 25.00,
    originalPrice: 35.00,
    rating: 4.9,
    reviewCount: 445,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80'
    ],
    description: 'Precision eyeliner with ultra-fine tip for perfect lines every time. Smudge-proof and water-resistant formula.',
    features: ['Precision tip', 'Smudge-proof', 'Water-resistant', 'Rich black color'],
    inStock: true,
    badge: 'sale'
  },
  {
    id: '6',
    name: 'Waterproof Gel Eyeliner',
    category: 'Eyes',
    price: 22.00,
    originalPrice: 35.00,
    rating: 4.8,
    reviewCount: 378,
    image: 'https://images.unsplash.com/photo-1583241800698-2d3d3d82d2b2?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1583241800698-2d3d3d82d2b2?w=800&q=80'
    ],
    description: 'Gel eyeliner that glides on smoothly and stays put all day. Perfect for creating dramatic looks.',
    features: ['Gel formula', 'Waterproof', 'Long-wearing', 'Includes brush'],
    inStock: true,
    badge: 'sale'
  },
  {
    id: '7',
    name: 'Brightening Day Cream',
    category: 'Skincare',
    price: 22.00,
    originalPrice: 32.00,
    rating: 4.5,
    reviewCount: 167,
    image: 'https://images.unsplash.com/photo-1556228852-80c3b5796f8e?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228852-80c3b5796f8e?w=800&q=80'
    ],
    description: 'Vitamin C enriched day cream that brightens and evens skin tone. Provides all-day hydration with SPF protection.',
    features: ['Vitamin C', 'SPF 30', 'Brightening', 'Anti-aging'],
    inStock: true
  },
  {
    id: '8',
    name: 'Under Eye Cream',
    category: 'Skincare',
    price: 15.00,
    originalPrice: 25.00,
    rating: 4.4,
    reviewCount: 203,
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800&q=80'
    ],
    description: 'Gentle eye cream that reduces dark circles and puffiness. Lightweight formula perfect for daily use.',
    features: ['Reduces dark circles', 'Anti-puffiness', 'Lightweight', 'Caffeine infused'],
    inStock: true
  },
  {
    id: '9',
    name: 'Hydrating Lip Balm',
    category: 'Lips',
    price: 8.00,
    rating: 4.6,
    reviewCount: 521,
    image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800&q=80'
    ],
    description: 'Nourishing lip balm with natural ingredients. Keeps lips soft and hydrated throughout the day.',
    features: ['Natural ingredients', 'Long-lasting moisture', 'SPF 15', 'Tinted options'],
    inStock: true
  },
  {
    id: '10',
    name: 'Matte Liquid Lipstick',
    category: 'Lips',
    price: 16.00,
    rating: 4.7,
    reviewCount: 389,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80'
    ],
    description: 'Long-wearing matte liquid lipstick with intense color payoff. Comfortable formula that doesn\'t dry out lips.',
    features: ['Matte finish', 'Long-wearing', 'Intense color', '12 shades available'],
    inStock: true
  },
  {
    id: '11',
    name: 'Volumizing Mascara',
    category: 'Eyes',
    price: 19.00,
    rating: 4.8,
    reviewCount: 612,
    image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=800&q=80'
    ],
    description: 'Volumizing mascara that creates dramatic lashes without clumping. Buildable formula for customizable volume.',
    features: ['Volumizing', 'No clumping', 'Buildable', 'Smudge-proof'],
    inStock: true
  },
  {
    id: '12',
    name: 'Facial Cleansing Oil',
    category: 'Skincare',
    price: 24.00,
    rating: 4.9,
    reviewCount: 287,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80'
    ],
    description: 'Gentle cleansing oil that removes makeup and impurities. Leaves skin clean and nourished without stripping.',
    features: ['Removes makeup', 'Gentle formula', 'Nourishing oils', 'Suitable for all skin types'],
    inStock: true
  }
];

export const categories = [
  'All',
  'Foundation',
  'Skincare',
  'Eyes',
  'Lips',
  'Makeup'
];
