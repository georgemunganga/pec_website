import { Link } from 'wouter';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/contexts/ComparisonContext';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Rating } from '@/components/Rating';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';

export default function Comparison() {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  if (comparisonList.length === 0) {
    return (
      <>
        <SEO title="Compare Products" description="Compare your selected products side by side" />
        <div className="min-h-screen flex items-center justify-center pb-20 md:pb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No products to compare</h2>
            <p className="text-muted-foreground mb-6">
              Add products to comparison from the shop page
            </p>
            <Link href="/shop">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Compare Products" description="Compare your selected products side by side" />
      <div className="min-h-screen pb-20 md:pb-8">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/shop">
                <Button variant="ghost" className="gap-2 mb-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Shop
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Compare Products</h1>
              <p className="text-muted-foreground">
                Comparing {comparisonList.length} {comparisonList.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            <Button variant="outline" onClick={clearComparison}>
              Clear All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-semibold min-w-[150px]">Feature</th>
                  {comparisonList.map(product => (
                    <th key={product.id} className="p-4 text-center min-w-[250px]">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 rounded-full"
                          onClick={() => removeFromComparison(product.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded-lg mx-auto mb-2"
                        />
                        <h3 className="font-semibold text-sm">{product.name}</h3>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">Price</td>
                  {comparisonList.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Rating</td>
                  {comparisonList.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Rating value={product.rating} />
                        <span className="text-sm text-muted-foreground">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Category</td>
                  {comparisonList.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      {product.category}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Brand</td>
                  {comparisonList.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      {product.brand || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Availability</td>
                  {comparisonList.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Skin Type</td>
                  {comparisonList.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      {product.skinType?.join(', ') || 'All'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium">Actions</td>
                  {comparisonList.map(product => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          className="w-full"
                        >
                          Add to Cart
                        </Button>
                        <Link href={`/product/${product.id}`}>
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
