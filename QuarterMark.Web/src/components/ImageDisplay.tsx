import React from 'react';
import './ImageDisplay.css';

interface ImageDisplayProps {
  imageUrl: string;
  altText?: string;
}

export function ImageDisplay({ imageUrl, altText = 'Contestant with Celebrity' }: ImageDisplayProps) {
  return (
    <div className="image-display">
      <img src={imageUrl} alt={altText} className="contestant-image" />
    </div>
  );
}

