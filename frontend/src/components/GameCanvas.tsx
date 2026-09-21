// ============================================
// AlgoArena - Game Canvas Renderer
// ============================================

import { useRef, useEffect, useCallback } from 'react';
import { Cell, GridState, DynamicObstacle, CELL_COLORS } from '../types';

interface GameCanvasProps {
  grid: GridState;
  dynamicObstacles?: DynamicObstacle[];
  onCellClick?: (x: number, y: number, button: number) => void;
  onCellDrag?: (x: number, y: number) => void;
  onHoverCell?: (cell: Cell | null) => void;
  cellSize?: number;
  showHeatmap?: boolean;
}

export function GameCanvas({
  grid,
  dynamicObstacles = [],
  onCellClick,
  onCellDrag,
  onHoverCell,
  cellSize = 28,
  showHeatmap = false,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const lastCellRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const glowPhaseRef = useRef(0);

  // Get cell color based on type and state (Light Theme High-Contrast)
  const getCellColor = useCallback((cell: Cell): string => {
    if (cell.isPath) {
      return '#7c3aed'; // Deep electric violet
    }
    if (cell.isVisited) {
      return '#93c5fd'; // Soft sky blue
    }
    
    return CELL_COLORS[cell.type];
  }, []);

  // Draw a single cell with effects
  const drawCell = useCallback((
    ctx: CanvasRenderingContext2D,
    cell: Cell,
    x: number,
    y: number,
    size: number
  ) => {
    const color = getCellColor(cell);
    const padding = 1;
    
    // Cell background
    ctx.fillStyle = color;
    ctx.fillRect(
      x * size + padding,
      y * size + padding,
      size - padding * 2,
      size - padding * 2
    );
    
    // Glow effect for path
    if (cell.isPath) {
      const glowIntensity = 0.5 + 0.5 * Math.sin(glowPhaseRef.current * 0.1);
      ctx.shadowColor = '#7c3aed';
      ctx.shadowBlur = 8 * glowIntensity;
      ctx.fillStyle = `rgba(124, 58, 237, ${0.4 + glowIntensity * 0.3})`;
      ctx.fillRect(
        x * size + padding,
        y * size + padding,
        size - padding * 2,
        size - padding * 2
      );
      ctx.shadowBlur = 0;
    }
    
    // Glow effect for start/end
    if (cell.type === 'start' || cell.type === 'end') {
      const glowIntensity = 0.5 + 0.5 * Math.sin(glowPhaseRef.current * 0.05 + (cell.type === 'start' ? 0 : Math.PI));
      ctx.shadowColor = cell.type === 'start' ? '#16a34a' : '#e11d48';
      ctx.shadowBlur = 12 * glowIntensity;
      ctx.strokeStyle = cell.type === 'start' ? '#16a34a' : '#e11d48';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        x * size + padding,
        y * size + padding,
        size - padding * 2,
        size - padding * 2
      );
      ctx.shadowBlur = 0;
    }
    
    // Terrain icons
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let icon = '';
    switch (cell.type) {
      case 'start':
        icon = '🚀';
        break;
      case 'end':
        icon = '🎯';
        break;
      case 'mud':
        icon = '💧';
        break;
      case 'water':
        icon = '🌊';
        break;
      case 'boost':
        icon = '⚡';
        break;
      case 'wall':
        // Draw brick pattern
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(
          x * size + padding + 2,
          y * size + padding + size / 3,
          size - padding * 2 - 4,
          size / 3
        );
        break;
    }
    
    if (icon) {
      ctx.fillText(icon, x * size + size / 2, y * size + size / 2 + 1);
    }
    
    // Cost indicator for mud/boost
    if (cell.type === 'mud' || cell.type === 'boost') {
      ctx.font = `${size * 0.3}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(
        cell.type === 'mud' ? '5x' : '½x',
        x * size + size - 8,
        y * size + size - 5
      );
    }
  }, [getCellColor]);

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = grid.width * cellSize;
    const height = grid.height * cellSize;
    
    // Clear canvas (Light Theme)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.75)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= grid.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= grid.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(width, y * cellSize);
      ctx.stroke();
    }
    
    // Draw heatmap overlay if enabled
    if (showHeatmap) {
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          const cell = grid.cells[y][x];
          if (cell.isVisited) {
            const intensity = 0.3 + (cell.g !== Infinity ? Math.min(cell.g / 100, 0.7) : 0);
            ctx.fillStyle = `rgba(255, 100, 0, ${intensity})`;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    }
    
    // Draw cells
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        drawCell(ctx, cell, x, y, cellSize);
      }
    }
    
    // Draw dynamic obstacles
    for (const obstacle of dynamicObstacles) {
      const x = obstacle.x * cellSize;
      const y = obstacle.y * cellSize;
      
      // Glowing danger zone
      const gradient = ctx.createRadialGradient(
        x + cellSize / 2,
        y + cellSize / 2,
        0,
        x + cellSize / 2,
        y + cellSize / 2,
        cellSize * 1.5
      );
      gradient.addColorStop(0, 'rgba(255, 50, 50, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 50, 50, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 50, 50, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Core
      ctx.fillStyle = '#ff3232';
      ctx.beginPath();
      ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Warning icon
      ctx.fillStyle = '#fff';
      ctx.font = `${cellSize * 0.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠️', x + cellSize / 2, y + cellSize / 2);
    }
    
    // Update glow phase
    glowPhaseRef.current++;
  }, [grid, cellSize, dynamicObstacles, showHeatmap, drawCell]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // Handle mouse events with exact normalized scaling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = Math.min(grid.width - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * grid.width)));
    const y = Math.min(grid.height - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * grid.height)));
    
    isDraggingRef.current = true;
    lastCellRef.current = { x, y };
    
    onCellClick?.(x, y, e.button);
  }, [grid.width, grid.height, onCellClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = Math.min(grid.width - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * grid.width)));
    const y = Math.min(grid.height - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * grid.height)));

    if (x >= 0 && x < grid.width && y >= 0 && y < grid.height) {
      onHoverCell?.(grid.cells[y][x]);
    } else {
      onHoverCell?.(null);
    }
    
    if (!isDraggingRef.current) return;
    
    if (lastCellRef.current?.x !== x || lastCellRef.current?.y !== y) {
      lastCellRef.current = { x, y };
      onCellDrag?.(x, y);
    }
  }, [grid.width, grid.height, grid.cells, onCellDrag, onHoverCell]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    lastCellRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
    lastCellRef.current = null;
    onHoverCell?.(null);
  }, [onHoverCell]);

  return (
    <div className="w-full flex justify-center items-center overflow-hidden p-1">
      <canvas
        ref={canvasRef}
        width={grid.width * cellSize}
        height={grid.height * cellSize}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={(e) => e.preventDefault()}
        className="rounded-2xl shadow-2xl block max-w-full h-auto cursor-crosshair transition-all"
        style={{
          aspectRatio: `${grid.width * cellSize} / ${grid.height * cellSize}`,
          maxWidth: '100%',
          maxHeight: 'min(580px, 60vh)',
          objectFit: 'contain',
          border: '2px solid rgba(203, 213, 225, 0.9)',
          boxShadow: '0 4px 25px rgba(0, 0, 0, 0.08)',
        }}
      />
    </div>
  );
}
