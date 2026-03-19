import React from 'react';
import { Star, CheckCircle, XCircle } from 'lucide-react';

export const ReviewsTab = ({ pendingReviews, reviewAction, onApprove, onReject }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-600">
          {pendingReviews.length === 0 
            ? 'No pending reviews to approve' 
            : `${pendingReviews.length} review${pendingReviews.length > 1 ? 's' : ''} waiting for approval`
          }
        </p>
      </div>

      {pendingReviews.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-stone-500">All reviews have been processed</p>
          <p className="text-sm mt-1">New reviews will appear here when submitted</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingReviews.map((review) => (
            <div key={review.id} className="bg-white border border-stone-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-slate to-brand-charcoal rounded-full flex items-center justify-center text-white font-bold">
                    {review.user_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">{review.user_name}</h4>
                    <p className="text-xs text-stone-500">{review.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-stone-700 mb-4 bg-stone-50 p-3 rounded-lg text-sm">
                "{review.review_text}"
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-stone-500">
                  <span>{review.country}</span>
                  <span className="mx-2">&bull;</span>
                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onReject(review.id)}
                    disabled={reviewAction === review.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(review.id)}
                    disabled={reviewAction === review.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
