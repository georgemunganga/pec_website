import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function Rating({ rating, reviewCount, size = 'sm' }: RatingProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.round(rating)
                ? 'fill-yellow-500 text-yellow-500'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className={`${textSizeClasses[size]} text-muted-foreground ml-1`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
