// ============================================
// AlgoArena - Maze Generator Dialog
// ============================================

import { useState } from 'react';
import { GridState } from '../types';
import { generateMaze, generateMazeWithDifficulty, generateSpiralMaze } from '../utils/mazeGenerator';
import { generateMapWithGeneticAlgorithm } from '../utils/geneticGenerator';

interface MazeGeneratorDialogProps {
  onGenerate: (grid: GridState) => void;
  onClose: () => void;
  width: number;
  height: number;
}

type MazeType = 'recursive' | 'spiral' | 'genetic';
type Difficulty = 'easy' | 'medium' | 'hard';

export function MazeGeneratorDialog({
  onGenerate,
  onClose,
  width,
  height,
}: MazeGeneratorDialogProps) {
  const [mazeType, setMazeType] = useState<MazeType>('recursive');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    // Use setTimeout to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 100));

    let grid: GridState;

    try {
      switch (mazeType) {
        case 'recursive':
          grid = generateMazeWithDifficulty(width, height, difficulty);
          break;
        case 'spiral':
          grid = generateSpiralMaze(width, height);
          break;
        case 'genetic':
          grid = generateMapWithGeneticAlgorithm(width, height, difficulty, (gen, _fitness) => {
            setProgress(Math.min(100, (gen / 50) * 100));
          });
          break;
        default:
          grid = generateMaze(width, height);
      }

      onGenerate(grid);
    } catch (error) {
      console.error('Error generating maze:', error);
    }

    setIsGenerating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">
            🗺️
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Maze Generator</h2>
            <p className="text-sm text-cyan-400">Generate challenging mazes</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Maze Type */}
          <div>
            <label className="text-cyan-400 text-sm font-semibold uppercase tracking-wider block mb-2">
              Maze Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'recursive' as MazeType, label: 'Recursive', icon: '🔲' },
                { type: 'spiral' as MazeType, label: 'Spiral', icon: '🌀' },
                { type: 'genetic' as MazeType, label: 'Genetic AI', icon: '🧬' },
              ].map(option => (
                <button
                  key={option.type}
                  onClick={() => setMazeType(option.type)}
                  disabled={isGenerating}
                  className={`
                    p-3 rounded-lg text-center transition-all
                    ${mazeType === option.type 
                      ? 'bg-cyan-500/30 border border-cyan-500/50 text-white' 
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-700/50'
                    }
                    disabled:opacity-50
                  `}
                >
                  <div className="text-xl mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-cyan-400 text-sm font-semibold uppercase tracking-wider block mb-2">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  disabled={isGenerating}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
                    ${difficulty === diff 
                      ? `${diff === 'easy' ? 'bg-green-500/30 text-green-300 border border-green-500/50' : ''}
                         ${diff === 'medium' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50' : ''}
                         ${diff === 'hard' ? 'bg-red-500/30 text-red-300 border border-red-500/50' : ''}`
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                    }
                    disabled:opacity-50
                  `}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          {isGenerating && mazeType === 'genetic' && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Evolving map...</span>
                <span className="text-cyan-400">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="p-3 bg-slate-800/50 rounded-lg text-sm text-slate-400">
            {mazeType === 'recursive' && (
              <>Recursive backtracker maze - classic maze generation with guaranteed solution path.</>
            )}
            {mazeType === 'spiral' && (
              <>Spiral pattern maze - a unique winding path from center to edge.</>
            )}
            {mazeType === 'genetic' && (
              <>AI-generated map using genetic algorithms. Evolves maps based on difficulty and fitness scores.</>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 px-4 py-3 bg-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-colors shadow-lg shadow-green-500/30 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
}
