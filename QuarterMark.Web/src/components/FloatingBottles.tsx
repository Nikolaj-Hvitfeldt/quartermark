import React from 'react';
import './FloatingBottles.css';

const BOTTLE_IMAGES = [
  '/images/smirnoff-images/smirnoff-citrus.jpg',
  '/images/smirnoff-images/smirnoff-colorful.jpg',
  '/images/smirnoff-images/smirnoff-original.jpg',
  '/images/smirnoff-images/smirnoff-red.jpg',
];

export function FloatingBottles() {
  // Triple the bottles to get 12 total (3 far + 3 close on each side)
  const allBottles = [...BOTTLE_IMAGES, ...BOTTLE_IMAGES, ...BOTTLE_IMAGES];
  
  return (
    <div className="floating-bottles-container">
      {allBottles.map((src, index) => (
        <img
          key={index}
          src={src}
          alt="Smirnoff Ice"
          className={`floating-bottle bottle-${index + 1}`}
        />
      ))}
    </div>
  );
}

