import { useEffect, useRef, useState } from 'react';
import { PlayerDto } from '../types';
import { BottleSvg } from './BottleSvg';
import './PieChartWheel.css';

interface PieChartWheelProps {
  players: PlayerDto[];
  selectedPlayer: string | null;
  isSpinning: boolean;
}

// The bottle image points straight up (-90° in screen angles, where 0° is 3 o'clock and angles
// grow clockwise). Rotating the image by `angle - BOTTLE_IMAGE_ANGLE` makes its neck point at `angle`.
const BOTTLE_IMAGE_ANGLE = -90;

// Spin speed while waiting for the server's pick, in degrees per ms (1.5 turns per second)
const SPIN_SPEED = 0.54;

export function PieChartWheel({ players, selectedPlayer, isSpinning }: PieChartWheelProps) {
  const spinnerRef = useRef<HTMLDivElement>(null);
  // Screen angle the bottle neck points at. Start pointing up.
  const [spinnerRotation, setSpinnerRotation] = useState(-90);
  const animationFrameRef = useRef<number | null>(null);
  const currentRotationRef = useRef(-90); // Read by animations without re-running effects

  // The parent passes a freshly filtered array on every render. Effects must not depend on
  // its identity, or a re-render mid-animation cancels the landing and the bottle stops
  // wherever it happens to be, often between two players.
  const playersRef = useRef(players);
  playersRef.current = players;

  const playerCount = players.length;
  const sliceAngle = 360 / playerCount;

  const cancelAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const setRotation = (rotation: number) => {
    setSpinnerRotation(rotation);
    currentRotationRef.current = rotation;
  };

  // Degrees per ms the bottle is turning right now, so the landing can pick up at the same speed
  const velocityRef = useRef(0);

  // Constant-speed spin until the server's pick arrives (it takes ~2s)
  const spinFreely = () => {
    cancelAnimation();
    const startRotation = currentRotationRef.current;
    const startTime = Date.now();
    velocityRef.current = SPIN_SPEED;

    const animate = () => {
      setRotation(startRotation + (Date.now() - startTime) * SPIN_SPEED);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // One continuous slow-down onto `distance` degrees further. A cubic ease-out starts at
  // 3 * distance / duration, so choosing duration = 3 * distance / speed makes it start at
  // exactly the current speed: no jerk when the result comes in, no extra push at the end.
  const decelerateBy = (distance: number) => {
    cancelAnimation();
    const startRotation = currentRotationRef.current;
    const speed = velocityRef.current;
    const duration = speed > 0 ? (3 * distance) / speed : 1500;
    const startTime = Date.now();

    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setRotation(startRotation + distance * easeOut);
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
        velocityRef.current = 0;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Cleanup any pending animation on unmount only
  useEffect(() => cancelAnimation, []);

  const colors = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'
  ];

  // Spin while the server picks a player (also on "spin again")
  useEffect(() => {
    if (isSpinning) spinFreely();
  }, [isSpinning]);

  // Result received: slow down clockwise into the middle of the selected player's slice
  useEffect(() => {
    if (!selectedPlayer || isSpinning) return;
    const playerIndex = playersRef.current.findIndex(p => p.name === selectedPlayer);
    if (playerIndex === -1) return;

    // Slices are drawn clockwise starting at the top (-90°)
    const sliceCenterAngle = -90 + playerIndex * sliceAngle + sliceAngle / 2;
    const forward = (((sliceCenterAngle - currentRotationRef.current) % 360) + 360) % 360;
    // While spinning, add one more lap so the slow-down is long enough to look natural
    decelerateBy(velocityRef.current > 0 ? forward + 360 : forward);
  }, [selectedPlayer, isSpinning, sliceAngle]);

  const renderSlice = (index: number, player: PlayerDto) => {
    // Slices are drawn starting from top (-90 degrees), going clockwise
    // Slice 0: from -90 to -90 + sliceAngle
    // Slice 1: from -90 + sliceAngle to -90 + 2*sliceAngle
    // etc.
    const startAngle = index * sliceAngle - 90; // Start from top (-90 degrees)
    const endAngle = (index + 1) * sliceAngle - 90;
    
    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const radius = 200;
    const centerX = 250;
    const centerY = 250;
    
    // Calculate path for pie slice
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    const color = colors[index % colors.length];

    return (
      <g key={index}>
        <path
          d={pathData}
          fill={color}
          stroke="white"
          strokeWidth="2"
          className="slice"
        />
        {/* Player name label */}
        <text
          x={centerX + (radius * 0.7) * Math.cos((startRad + endRad) / 2)}
          y={centerY + (radius * 0.7) * Math.sin((startRad + endRad) / 2)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          className="slice-label"
        >
          {player.name}
        </text>
      </g>
    );
  };

  return (
    <div className="pie-chart-wheel-container">
      <div className="pie-wheel">
        <svg width="500" height="500" viewBox="0 0 500 500">
          <circle cx="250" cy="250" r="200" fill="none" stroke="white" strokeWidth="4" />
          {players.map((player, index) => renderSlice(index, player))}
        </svg>
      </div>
      <div 
        ref={spinnerRef}
        className="bottle-center"
        style={{
          transform: `translate(-50%, -50%) rotate(${spinnerRotation - BOTTLE_IMAGE_ANGLE}deg)`,
          transition: 'none' // Animation is handled by requestAnimationFrame, not CSS
        }}
      >
        <BottleSvg className="bottle-spinner" />
      </div>
    </div>
  );
}

