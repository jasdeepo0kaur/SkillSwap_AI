import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onRatingChange = null, size = 16 }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex-align-center gap-05" style={{ display: 'inline-flex' }}>
      {stars.map((star) => (
        <Star
          key={star}
          size={size}
          onClick={onRatingChange ? () => onRatingChange(star) : null}
          style={{ 
            cursor: onRatingChange ? 'pointer' : 'default',
            transition: 'color 0.15s ease'
          }}
          color={star <= rating ? '#fbbf24' : '#6b7280'}
          fill={star <= rating ? '#fbbf24' : 'transparent'}
        />
      ))}
    </div>
  );
};

export default StarRating;
