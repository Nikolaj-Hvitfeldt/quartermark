import React, { useEffect, useRef, useState } from 'react';
import { PlayerDto } from '../types';
import { BottleSvg } from './BottleSvg';
import './PieChartWheel.css';

interface PieChartWheelProps {
  players: PlayerDto[];
  selectedPlayer: string | null;
  isSpinning: boolean;
}

export function PieChartWheel({ players, selectedPlayer, isSpinning }: PieChartWheelProps) {
  const spinnerRef = useRef<HTMLDivElement>(null);
  const [spinnerRotation, setSpinnerRotation] = useState(-90); // Start pointing up
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const hasStartedSpinningRef = useRef(false);
  const hasResultBeenShownRef = useRef(false); // Track if we've shown a result to prevent restarting
  const hasStartedFinalAnimationRef = useRef(false); // Track if we've started the final animation
  const currentRotationRef = useRef(-90); // Track current rotation in a ref to avoid dependency issues

  const playerCount = players.length;
  const sliceAngle = 360 / playerCount;

  // Cleanup any pending animation on unmount only
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  const colors = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'
  ];

  // Reset spinning state when isSpinning becomes false, but only if we don't have a selected player
  // This prevents the spinner from restarting after a result is shown
  useEffect(() => {
    if (!isSpinning && !selectedPlayer && !hasResultBeenShownRef.current) {
      hasStartedSpinningRef.current = false;
      hasStartedFinalAnimationRef.current = false; // Reset final animation flag too
      setIsAnimating(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isSpinning, selectedPlayer]);

  // Update ref when rotation changes
  useEffect(() => {
    currentRotationRef.current = spinnerRotation;
  }, [spinnerRotation]);

  // Start spinning animation
  useEffect(() => {
    if (isSpinning && !selectedPlayer && !hasStartedSpinningRef.current && !hasResultBeenShownRef.current) {
      hasStartedSpinningRef.current = true;
      setIsAnimating(true);
      // Start spinning with at least 1 full rotation plus some extra
      const minRotation = 360;
      const extraRotation = Math.random() * 360;
      // Use the ref to get the current rotation at the start of the animation
      const startRotation = currentRotationRef.current;
      const targetRotation = startRotation + minRotation + extraRotation;
      
      // Continuously update rotation during animation
      const startTime = Date.now();
      const duration = 3000; // 3 seconds
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Use easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
        setSpinnerRotation(currentRotation);
        currentRotationRef.current = currentRotation; // Update ref
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Initial animation complete - wait for result
          setIsAnimating(false);
          animationFrameRef.current = null;
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }
  }, [isSpinning, selectedPlayer]); // Removed spinnerRotation from dependencies

  // Calculate the target rotation when result is received - smoothly transition to final position WITHOUT additional full rotation
  useEffect(() => {
    if (selectedPlayer && !isSpinning && !hasStartedFinalAnimationRef.current) {
      hasResultBeenShownRef.current = true; // Mark that we've shown a result
      hasStartedFinalAnimationRef.current = true; // Mark that we've started the final animation
      const playerIndex = players.findIndex(p => p.name === selectedPlayer);
      if (playerIndex !== -1) {
        // Cancel any ongoing animation first
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        setIsAnimating(true);
        
        // Use the ref to get the current rotation at the start
        const currentRotation = currentRotationRef.current;
        
        // Calculate the center angle of the selected player's slice
        // Slices are drawn starting from -90 degrees (top)
        // Slice center in SVG coordinates: -90 + playerIndex * sliceAngle + sliceAngle / 2
        const sliceCenterAngle = -90 + playerIndex * sliceAngle + sliceAngle / 2;
        
        // Get current rotation normalized to 0-360
        const currentNormalized = ((currentRotation % 360) + 360) % 360;
        
        // Calculate how much we need to rotate from current position to point at the slice
        let targetNormalized = ((sliceCenterAngle % 360) + 360) % 360;
        
        // Calculate shortest rotation path
        let rotationNeeded = targetNormalized - currentNormalized;
        if (rotationNeeded > 180) rotationNeeded -= 360;
        if (rotationNeeded < -180) rotationNeeded += 360;
        
        // Smoothly transition from current position to target (no extra full rotation)
        const startRotation = currentRotation;
        const finalRotation = startRotation + rotationNeeded;
        
        // Animate to final position with continuous updates
        const startTime = Date.now();
        const duration = 1500; // Shorter duration for final positioning
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Use cubic-bezier easing
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const newRotation = startRotation + (finalRotation - startRotation) * easeOut;
          setSpinnerRotation(newRotation);
          currentRotationRef.current = newRotation; // Update ref
          
          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
          } else {
            setIsAnimating(false);
            animationFrameRef.current = null;
          }
        };
        
        animationFrameRef.current = requestAnimationFrame(animate);
        
        return () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        };
      }
    }
  }, [selectedPlayer, isSpinning, players, sliceAngle]); // Removed spinnerRotation from dependencies - use ref instead

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
          transform: `translate(-50%, -50%) rotate(${spinnerRotation}deg)`,
          transition: 'none' // Animation is handled by requestAnimationFrame, not CSS
        }}
      >
        <BottleSvg className="bottle-spinner" />
      </div>
    </div>
  );
}

