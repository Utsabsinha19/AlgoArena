// ============================================
// AlgoArena - Terrain Palette Component
// ============================================

import { CellType, CELL_COLORS } from '../types';

interface TerrainPaletteProps {
  selectedTerrain: CellType;
  onTerrainSelect: (terrain: CellType) => void;
  disabled?: boolean;
}

const TERRAIN_OPTIONS: { type: CellType; label: string; icon: string; description: string }[] = [
  { type: 'normal', label: 'Normal', icon: '⬜', description: 'Cost: 1' },
  { type: 'wall', label: 'Wall', icon: '🧱', description: 'Blocked' },
  { type: 'mud', label: 'Mud', icon: '💧', description: 'Cost: 5x' },
  { type: 'water', label: 'Water', icon: '🌊', description: 'Blocked' },
  { type: 'boost', label: 'Boost', icon: '⚡', description: 'Cost: 0.5x' },
  { type: 'start', label: 'Start', icon: '🚀', description: 'Start point' },
  { type: 'end', label: 'End', icon: '🎯', description: 'End point' },
];

export function TerrainPalette({
  selectedTerrain,
  onTerrainSelect,
  disabled = false,
}: TerrainPaletteProps) {
  return (
    <div className="p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-cyan-500/20">
      <h3 className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-3">
        Terrain Palette
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {TERRAIN_OPTIONS.map((terrain) => (
          <button
            key={terrain.type}
            onClick={() => onTerrainSelect(terrain.type)}
            disabled={disabled}
            className={`
              relative p-3 rounded-lg text-left transition-all duration-200
              ${selectedTerrain === terrain.type 
                ? 'bg-cyan-500/20 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            style={{
              borderColor: selectedTerrain === terrain.type ? CELL_COLORS[terrain.type] : undefined,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{terrain.icon}</span>
              <div>
                <div className={`font-medium ${selectedTerrain === terrain.type ? 'text-white' : 'text-slate-300'}`}>
                  {terrain.label}
                </div>
                <div className="text-xs text-slate-500">
                  {terrain.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 p-2 bg-slate-800/30 rounded-lg text-xs text-slate-400">
        <p>🖱️ Click to place terrain</p>
        <p>📍 Drag to paint multiple cells</p>
      </div>
    </div>
  );
}
