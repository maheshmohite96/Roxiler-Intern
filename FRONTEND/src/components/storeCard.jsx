import React, { useState } from 'react';
import { Star, MapPin, Mail, Calendar, User, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Rating from './Ratings';

export default function StoreCard({
  store,
  onRatingUpdate,
  isUser = false,
  showActions = true
}) {
  const [userRating, setUserRating] = useState(store.user_rating ? parseFloat(store.user_rating) : 0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasRated, setHasRated] = useState(store.user_rating ? parseFloat(store.user_rating) > 0 : false);

  const handleRatingSelect = (rating) => {
    if (!isUser || !showActions) return;
    setSelectedRating(rating);
  };

  const handleRatingSubmit = async () => {
    if (!isUser || !showActions || selectedRating === 0) return;

    try {
      setIsSubmitting(true);
      await axios.post(`/api/ratings/${store.id}`, { rating: selectedRating });
      setUserRating(selectedRating);
      setHasRated(true);
      toast.success(hasRated ? 'Rating updated successfully!' : 'Rating submitted successfully!');
      if (onRatingUpdate) {
        onRatingUpdate(store.id, selectedRating);
      }
      setSelectedRating(0); // Reset selection after submission
    } catch (error) {
      toast.error('Failed to submit rating: ' + (error.response?.data?.message || error.message));
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingDelete = async () => {
    if (!isUser || !showActions) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/api/ratings/${store.id}`);
      setUserRating(0);
      setHasRated(false);
      setSelectedRating(0);
      toast.success('Rating removed successfully!');
      if (onRatingUpdate) {
        onRatingUpdate(store.id, null);
      }
    } catch (error) {
      toast.error('Failed to remove rating: ' + (error.response?.data?.message || error.message));
      console.error('Error removing rating:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRatingUpdate = () => {
    if (!isUser || !showActions) return;
    setHasRated(false);
    setSelectedRating(0);
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : 'div'}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            disabled={!interactive || isSubmitting}
          >
            <Star
              className={`h-4 w-4 ${star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
                }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "-";
    }
  };

  const averageRating = store.average_rating ? parseFloat(store.average_rating) : 0;
  const totalRatings = store.total_ratings || 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-100">
      {/* Store Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {store.name || store.storeName}
        </h3>

        {/* Store Details */}
        <div className="space-y-2 text-sm text-gray-600">
          {store.address && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{store.address}</span>
            </div>
          )}

          {store.email && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{store.email}</span>
            </div>
          )}



          {store.owner_name && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>Owner: {store.owner_name}</span>
            </div>
          )}

          {store.created_at && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Joined {formatDate(store.created_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Store Description */}
      {store.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">{store.description}</p>
        </div>
      )}

      {/* Rating Section */}
      <div className="border-t pt-4">
        {/* Overall Rating */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Overall Rating</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-blue-600">
              {averageRating > 0 ? `${averageRating.toFixed(1)}/5` : "-"}
            </span>
            <div className="flex items-center space-x-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-xs text-gray-500">
              ({totalRatings} rating{totalRatings !== 1 ? 's' : ''})
            </span>
          </div>
        </div>

        {/* User Rating Section - Only show for users */}
        {isUser && showActions && (
          <div className="space-y-3">
            {hasRated ? (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Your Rating</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(userRating)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={handleRatingUpdate}
                        disabled={isSubmitting}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center space-x-1 disabled:opacity-50"
                      >
                        <span>Update</span>
                      </button>
                      <button
                        onClick={handleRatingDelete}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 text-xs flex items-center space-x-1 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isDeleting ? 'Removing...' : 'Remove'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  {hasRated ? 'Update your rating' : 'Rate this store'}
                </span>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Rating
                      value={selectedRating}
                      onChange={handleRatingSelect}
                    />
                    {selectedRating > 0 && (
                      <span className="text-sm text-gray-600">
                        {selectedRating} star{selectedRating !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {selectedRating > 0 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRatingSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>{hasRated ? 'Update Rating' : 'Submit Rating'}</span>
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedRating(0)}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
