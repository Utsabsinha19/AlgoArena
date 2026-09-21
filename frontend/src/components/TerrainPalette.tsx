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
    <div className="p-4 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-md text-slate-800">
      <h3 className="text-slate-800 text-sm font-bold uppercase tracking-wider mb-3">
        Terrain Palette
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {TERRAIN_OPTIONS.map((terrain) => (
          <button
            key={terrain.type}
            onClick={() => onTerrainSelect(terrain.type)}
            disabled={disabled}
            className={`
              relative p-3 rounded-xl text-left transition-all duration-200 shadow-xs
              ${selectedTerrain === terrain.type 
                ? 'bg-cyan-50/80 border-2 border-cyan-600 shadow-sm' 
                : 'bg-slate-50 border border-slate-200 hover:bg-slate-100/90'
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
                <div className={`font-semibold text-xs ${selectedTerrain === terrain.type ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                  {terrain.label}
                </div>
                <div className="text-[10px] text-slate-500">
                  {terrain.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 p-2.5 bg-slate-100 rounded-xl text-xs text-slate-600 border border-slate-200/80">
        <p>🖱️ Click to place terrain</p>
        <p>📍 Drag to paint multiple cells</p>
      </div>
    </div>
  );
}
