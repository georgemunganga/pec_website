import { useState, useEffect } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { productsAPI } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  verified: boolean;
  status?: string;
  moderationStatus?: string;
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [actionReviewId, setActionReviewId] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getReviews(productId);
      const payload = data.reviews || data.items || data.data || [];
      setReviews(payload);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);
    try {
      await productsAPI.addReview(productId, { rating, comment });
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setRating(0);
      setComment('');
      loadReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewId) return;
    if (editRating === 0 || !editComment.trim()) {
      toast.error('Update rating and comment before saving');
      return;
    }
    setActionReviewId(editingReviewId);
    try {
      await productsAPI.updateReview(productId, editingReviewId, {
        rating: editRating,
        comment: editComment,
      });
      toast.success('Review updated');
      cancelEditing();
      loadReviews();
    } catch (error) {
      toast.error('Failed to update review');
    } finally {
      setActionReviewId(null);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Delete this review?')) return;
    setActionReviewId(reviewId);
    try {
      await productsAPI.deleteReview(productId, reviewId);
      toast.success('Review removed');
      if (editingReviewId === reviewId) {
        cancelEditing();
      }
      loadReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    } finally {
      setActionReviewId(null);
    }
  };

  const handleHelpful = async (reviewId: number) => {
    if (!user) {
      toast.error('Please login to mark reviews as helpful');
      return;
    }

    try {
      await productsAPI.markReviewHelpful(reviewId);
      toast.success('Thank you for your feedback!');
      loadReviews();
    } catch (error) {
      toast.error('Failed to mark review as helpful');
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100
      : 0,
  }));

  const getModerationLabel = (review: Review) => {
    const status = review.moderationStatus || review.status;
    if (!status) return null;
    if (status === 'pending') return 'Pending moderation';
    if (status === 'rejected') return 'Hidden by moderators';
    return null;
  };

  const isOwner = (review: Review) => user?.id === review.userId;

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-card rounded-3xl p-6 md:p-8 border border-border">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-bold mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{stars}</span>
                  <Star className="h-3 w-3 fill-primary text-primary" />
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        {!showReviewForm && (
          <div className="mt-6 pt-6 border-t border-border">
            <Button
              onClick={() => setShowReviewForm(true)}
              className="rounded-full"
            >
              Write a Review
            </Button>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-card rounded-3xl p-6 md:p-8 border border-border">
          <h3 className="text-xl font-bold mb-6">Write Your Review</h3>
          
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div className="space-y-2">
              <Label>Your Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false);
                  setRating(0);
                  setComment('');
                }}
                className="rounded-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card rounded-3xl p-6 border border-border"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {review.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold">{review.userName}</span>
                    {review.verified && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                    {getModerationLabel(review) && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {getModerationLabel(review)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {editingReviewId === review.id ? (
                    <form onSubmit={handleUpdateReview} className="space-y-3">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                star <= editRating ? 'fill-primary text-primary' : 'text-muted-foreground'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <Textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={3} />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={actionReviewId === review.id}>
                          {actionReviewId === review.id ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={cancelEditing}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-foreground mb-4">{review.comment}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleHelpful(review.id)}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Helpful ({review.helpful})
                        </button>
                        {isOwner(review) && (
                          <>
                            <button
                              onClick={() => startEditing(review)}
                              className="text-sm text-primary hover:underline"
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-sm text-destructive hover:underline"
                              type="button"
                              disabled={actionReviewId === review.id}
                            >
                              {actionReviewId === review.id ? 'Removing...' : 'Delete'}
                            </button>
                          </>
                        )}
                      </div>
                      {getModerationLabel(review) && (
                        <p className="text-xs text-amber-600 mt-2">
                          This review is awaiting moderation and may be hidden from other shoppers.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
