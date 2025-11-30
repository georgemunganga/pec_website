import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { X, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

export interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  skinTypes: string[];
}

interface ProductFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCategories: string[];
  availableBrands: string[];
  availableSkinTypes: string[];
}

export function ProductFilters({
  filters,
  onFiltersChange,
  availableCategories,
  availableBrands,
  availableSkinTypes,
}: ProductFiltersProps) {
  const [open, setOpen] = useState(false);

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]],
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    
    onFiltersChange({
      ...filters,
      brands: newBrands,
    });
  };

  const handleSkinTypeToggle = (skinType: string) => {
    const newSkinTypes = filters.skinTypes.includes(skinType)
      ? filters.skinTypes.filter(s => s !== skinType)
      : [...filters.skinTypes, skinType];
    
    onFiltersChange({
      ...filters,
      skinTypes: newSkinTypes,
    });
  };

  const handleClearAll = () => {
    onFiltersChange({
      priceRange: [0, 200],
      categories: [],
      brands: [],
      skinTypes: [],
    });
  };

  const activeFilterCount = 
    filters.categories.length + 
    filters.brands.length + 
    filters.skinTypes.length +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 200 ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Price Range</Label>
          <span className="text-sm text-muted-foreground">
            K{filters.priceRange[0]} - K{filters.priceRange[1]}
          </span>
        </div>
        <Slider
          min={0}
          max={200}
          step={5}
          value={filters.priceRange}
          onValueChange={handlePriceChange}
          className="w-full"
        />
      </div>

      {/* Categories */}
      {availableCategories.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Categories</Label>
          <div className="space-y-2">
            {availableCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Brands</Label>
          <div className="space-y-2">
            {availableBrands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <label
                  htmlFor={`brand-${brand}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skin Types */}
      {availableSkinTypes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Skin Type</Label>
          <div className="space-y-2">
            {availableSkinTypes.map((skinType) => (
              <div key={skinType} className="flex items-center space-x-2">
                <Checkbox
                  id={`skin-${skinType}`}
                  checked={filters.skinTypes.includes(skinType)}
                  onCheckedChange={() => handleSkinTypeToggle(skinType)}
                />
                <label
                  htmlFor={`skin-${skinType}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {skinType}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={handleClearAll}
          className="w-full rounded-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="bg-card rounded-3xl p-6 border border-border sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-full gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
