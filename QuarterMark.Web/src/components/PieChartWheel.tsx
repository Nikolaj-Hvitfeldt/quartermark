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

  const animateTo = (targetRotation: number, duration: number) => {
    cancelAnimation();
    const startRotation = currentRotationRef.current;
    const startTime = Date.now();

    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const rotation = startRotation + (targetRotation - startRotation) * easeOut;
      setSpinnerRotation(rotation);
      currentRotationRef.current = rotation;
      animationFrameRef.current = progress < 1 ? requestAnimationFrame(animate) : null;
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

  // Spin freely while the server picks a player (also on "spin again")
  useEffect(() => {
    if (!isSpinning) return;
    // At least 1 full rotation plus some extra
    animateTo(currentRotationRef.current + 360 + Math.random() * 360, 3000);
  }, [isSpinning]);

  // Result received: keep turning clockwise and land in the middle of the selected player's slice
  useEffect(() => {
    if (!selectedPlayer || isSpinning) return;
    const playerIndex = playersRef.current.findIndex(p => p.name === selectedPlayer);
    if (playerIndex === -1) return;

    // Slices are drawn clockwise starting at the top (-90°)
    const sliceCenterAngle = -90 + playerIndex * sliceAngle + sliceAngle / 2;
    const current = currentRotationRef.current;
    const forward = (((sliceCenterAngle - current) % 360) + 360) % 360;
    animateTo(current + forward, 1500);
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

