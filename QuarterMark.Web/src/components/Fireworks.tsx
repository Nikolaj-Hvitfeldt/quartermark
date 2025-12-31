import { useEffect, useState, useRef } from 'react';
import './Fireworks.css';
import { FIREWORK_COLORS, FIREWORK_SIZES, FIREWORKS_CONFIG, FireworkSize } from '../utils/finalResultsConstants';

interface FireworkParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  color: string;
  size: FireworkSize;
}

interface FireworksProps {
  active: boolean;
}

export function Fireworks({ active }: FireworksProps) {
  const [particles, setParticles] = useState<FireworkParticle[]>([]);
  const idCounterRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      idCounterRef.current = 0; // Reset counter when inactive
      return;
    }
    
    const createBurst = () => {
      const newParticles = Array.from({ length: FIREWORKS_CONFIG.PARTICLES_PER_BURST }, () => ({
        id: idCounterRef.current++,
        x: FIREWORKS_CONFIG.X_POSITION_MIN + Math.random() * (FIREWORKS_CONFIG.X_POSITION_MAX - FIREWORKS_CONFIG.X_POSITION_MIN),
        y: FIREWORKS_CONFIG.Y_POSITION_MIN + Math.random() * (FIREWORKS_CONFIG.Y_POSITION_MAX - FIREWORKS_CONFIG.Y_POSITION_MIN),
        delay: Math.random() * FIREWORKS_CONFIG.INITIAL_DELAY_MAX,
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        size: FIREWORK_SIZES[Math.floor(Math.random() * FIREWORK_SIZES.length)],
      }));
      setParticles(prev => [...prev.slice(-(FIREWORKS_CONFIG.MAX_PARTICLES - FIREWORKS_CONFIG.PARTICLES_PER_BURST)), ...newParticles]);
    };

    createBurst();
    const interval = setInterval(createBurst, FIREWORKS_CONFIG.BURST_INTERVAL_MS);
    
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fireworks-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`firework firework-${particle.size}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            '--firework-color': particle.color,
          } as React.CSSProperties}
        >
          <div className="firework-burst">
            {Array.from({ length: FIREWORKS_CONFIG.SPARKS_PER_FIREWORK }).map((_, i) => (
              <div 
                key={i} 
                className="firework-spark"
                style={{ transform: `rotate(${i * FIREWORKS_CONFIG.SPARK_DEGREES}deg)` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

