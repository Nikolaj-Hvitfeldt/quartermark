import React from 'react';

interface BottleSvgProps {
  className?: string;
}

export const BottleSvg: React.FC<BottleSvgProps> = ({ className = '' }) => {
  return (
    <img 
      src="/images/smirnoff-bottle.svg" 
      alt="Smirnoff Ice Bottle" 
      className={className}
    />
  );
};

