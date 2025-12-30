interface BottleSvgProps {
  className?: string;
}

export const BottleSvg = ({ className = '' }: BottleSvgProps) => {
  return (
    <img 
      src="/images/smirnoff-images/smirnoff-bottle.svg" 
      alt="Smirnoff Ice Bottle" 
      className={className}
    />
  );
};

