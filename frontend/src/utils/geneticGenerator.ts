// ============================================
// AlgoArena - Genetic Algorithm Map Generator
// ============================================

import { GridState, CellType } from '../types';
import { initializeGrid, setCellType } from './gridUtils';
import { runAlgorithm } from '../algorithms/index';

// Individual map in the population
interface MapIndividual {
  grid: GridState;
  fitness: number;
  difficulty: number;
}

// Genetic algorithm parameters
const POPULATION_SIZE = 20;
const GENERATIONS = 50;
const MUTATION_RATE = 0.1;
const CROSSOVER_RATE = 0.7;
const ELITISM_COUNT = 2;

// Calculate difficulty of a map
function calculateDifficulty(grid: GridState): number {
  let score = 0;
  const { cells, width, height, start, end } = grid;
  
  // Factor 1: Obstacle density
  let obstacleCount = 0;
  let terrainVariety = 0;
  const terrainTypes = new Set<CellType>();
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = cells[y][x];
      if (cell.type === 'wall' || cell.type === 'water') {
        obstacleCount++;
      }
      terrainTypes.add(cell.type);
    }
  }
  
  const obstacleDensity = obstacleCount / (width * height);
  score += obstacleDensity * 30; // Max 30 points
  
  // Factor 2: Terrain variety
  terrainVariety = terrainTypes.size;
  score += terrainVariety * 5; // Max ~35 points
  
  // Factor 3: Path complexity
  if (start && end) {
    const result = runAlgorithm('astar', grid);
    
    if (result.path.length > 0) {
      // Longer path = more difficult
      const pathRatio = result.path.length / (width + height);
      score += pathRatio * 20; // Max 20 points
      
      // More nodes visited = more complex
      const visitedRatio = result.nodesVisited / (width * height);
      score += visitedRatio * 15; // Max 15 points
    } else {
      // No path = invalid map
      score = 0;
    }
  }
  
  return Math.min(100, score);
}

// Calculate fitness (balance between solvable and challenging)
function calculateFitness(individual: MapIndividual): number {
  const { grid } = individual;
  const difficulty = calculateDifficulty(grid);
  
  if (!grid.start || !grid.end) return 0;
  
  // Test all algorithms
  const results = {
    bfs: runAlgorithm('bfs', grid),
    dfs: runAlgorithm('dfs', grid),
    dijkstra: runAlgorithm('dijkstra', grid),
    astar: runAlgorithm('astar', grid),
    greedy: runAlgorithm('greedy', grid),
  };
  
  // All algorithms should find a path
  const allSolvable = Object.values(results).every(r => r.path.length > 0);
  if (!allSolvable) return 0;
  
  // Fitness based on difficulty balance
  let fitness = 50 + difficulty * 0.5;
  
  // Bonus for requiring different algorithms
  const pathLengths = Object.values(results).map(r => r.path.length);
  const variance = calculateVariance(pathLengths);
  fitness += variance * 0.5;
  
  // Bonus for interesting cost differences (Dijkstra vs BFS)
  if (results.dijkstra.cost !== results.bfs.cost) {
    fitness += 10;
  }
  
  return fitness;
}

// Calculate variance
function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
}

// Create random individual
function createRandomIndividual(width: number, height: number): MapIndividual {
  let grid = initializeGrid(width, height);
  
  // Random terrain placement
  const terrainDensity = 0.15 + Math.random() * 0.2;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid.cells[y][x].type === 'start' || grid.cells[y][x].type === 'end') continue;
      
      const rand = Math.random();
      
      if (rand < terrainDensity * 0.4) {
        grid = setCellType(grid, x, y, 'wall');
      } else if (rand < terrainDensity * 0.6) {
        grid = setCellType(grid, x, y, 'mud');
      } else if (rand < terrainDensity * 0.65) {
        grid = setCellType(grid, x, y, 'water');
      } else if (rand < terrainDensity * 0.7) {
        grid = setCellType(grid, x, y, 'boost');
      }
    }
  }
  
  const individual: MapIndividual = {
    grid,
    fitness: 0,
    difficulty: 0,
  };
  
  individual.difficulty = calculateDifficulty(grid);
  individual.fitness = calculateFitness(individual);
  
  return individual;
}

// Crossover two parents
function crossover(parent1: MapIndividual, parent2: MapIndividual): MapIndividual[] {
  const grid1 = parent1.grid;
  const grid2 = parent2.grid;
  
  // Single-point crossover
  const crossoverX = Math.floor(Math.random() * grid1.width);
  const crossoverY = Math.floor(Math.random() * grid1.height);
  
  const child1Grid = initializeGrid(grid1.width, grid1.height);
  const child2Grid = initializeGrid(grid1.width, grid1.height);
  
  // Create children
  for (let y = 0; y < grid1.height; y++) {
    for (let x = 0; x < grid1.width; x++) {
      const source1 = (y < crossoverY || (y === crossoverY && x < crossoverX)) ? grid1 : grid2;
      const source2 = (y < crossoverY || (y === crossoverY && x < crossoverX)) ? grid2 : grid1;
      
      child1Grid.cells[y][x] = { ...source1.cells[y][x] };
      child2Grid.cells[y][x] = { ...source2.cells[y][x] };
    }
  }
  
  // Preserve start/end
  child1Grid.start = grid1.start;
  child1Grid.end = grid1.end;
  child2Grid.start = grid2.start;
  child2Grid.end = grid2.end;
  
  const child1: MapIndividual = { grid: child1Grid, fitness: 0, difficulty: 0 };
  const child2: MapIndividual = { grid: child2Grid, fitness: 0, difficulty: 0 };
  
  child1.difficulty = calculateDifficulty(child1Grid);
  child1.fitness = calculateFitness(child1);
  child2.difficulty = calculateDifficulty(child2Grid);
  child2.fitness = calculateFitness(child2);
  
  return [child1, child2];
}

// Mutate individual
function mutate(individual: MapIndividual): MapIndividual {
  const { grid } = individual;
  let newGrid = { ...grid, cells: grid.cells.map(row => row.map(cell => ({ ...cell }))) };
  
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (newGrid.cells[y][x].type === 'start' || newGrid.cells[y][x].type === 'end') continue;
      
      if (Math.random() < MUTATION_RATE) {
        const terrainTypes: CellType[] = ['normal', 'wall', 'mud', 'water', 'boost'];
        const newType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
        newGrid = setCellType(newGrid, x, y, newType);
      }
    }
  }
  
  const mutated: MapIndividual = {
    grid: newGrid,
    fitness: 0,
    difficulty: 0,
  };
  
  mutated.difficulty = calculateDifficulty(newGrid);
  mutated.fitness = calculateFitness(mutated);
  
  return mutated;
}

// Selection (tournament)
function tournamentSelection(population: MapIndividual[]): MapIndividual {
  const tournamentSize = 3;
  const tournament: MapIndividual[] = [];
  
  for (let i = 0; i < tournamentSize; i++) {
    const idx = Math.floor(Math.random() * population.length);
    tournament.push(population[idx]);
  }
  
  tournament.sort((a, b) => b.fitness - a.fitness);
  return tournament[0];
}

// Main genetic algorithm
export function generateMapWithGeneticAlgorithm(
  width: number,
  height: number,
  targetDifficulty: 'easy' | 'medium' | 'hard' = 'medium',
  onProgress?: (generation: number, bestFitness: number) => void
): GridState {
  // Initialize population
  const population: MapIndividual[] = [];
  
  for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(createRandomIndividual(width, height));
  }
  
  // Sort by fitness
  population.sort((a, b) => b.fitness - a.fitness);
  
  // Difficulty target ranges
  const difficultyRange = {
    easy: [20, 40],
    medium: [40, 60],
    hard: [60, 85],
  };
  
  const [minDiff, maxDiff] = difficultyRange[targetDifficulty];
  
  // Evolve
  for (let gen = 0; gen < GENERATIONS; gen++) {
    const newPopulation: MapIndividual[] = [];
    
    // Elitism - keep best individuals
    population.sort((a, b) => b.fitness - a.fitness);
    for (let i = 0; i < ELITISM_COUNT; i++) {
      newPopulation.push({ ...population[i] });
    }
    
    // Generate new individuals
    while (newPopulation.length < POPULATION_SIZE) {
      const parent1 = tournamentSelection(population);
      const parent2 = tournamentSelection(population);
      
      let children: MapIndividual[];
      
      if (Math.random() < CROSSOVER_RATE) {
        children = crossover(parent1, parent2);
      } else {
        children = [parent1, parent2];
      }
      
      for (const child of children) {
        const mutatedChild = Math.random() < MUTATION_RATE ? mutate(child) : child;
        newPopulation.push(mutatedChild);
      }
    }
    
    // Replace population
    population.length = 0;
    population.push(...newPopulation.slice(0, POPULATION_SIZE));
    
    // Report progress
    population.sort((a, b) => b.fitness - a.fitness);
    onProgress?.(gen + 1, population[0].fitness);
    
    // Early termination if we find a good map in difficulty range
    const best = population[0];
    if (best.difficulty >= minDiff && best.difficulty <= maxDiff && best.fitness > 80) {
      break;
    }
  }
  
  // Find best individual in target difficulty range
  population.sort((a, b) => {
    const inRangeA = a.difficulty >= minDiff && a.difficulty <= maxDiff;
    const inRangeB = b.difficulty >= minDiff && b.difficulty <= maxDiff;
    
    if (inRangeA && !inRangeB) return -1;
    if (!inRangeA && inRangeB) return 1;
    
    return b.fitness - a.fitness;
  });
  
  // Return best grid, or create a new one if all invalid
  const best = population[0];
  
  if (best.fitness === 0) {
    // Fallback to random map
    return createRandomIndividual(width, height).grid;
  }
  
  return best.grid;
}

// Generate multiple maps for selection
export function generateMapOptions(
  width: number,
  height: number,
  count: number = 3
): { grid: GridState; difficulty: number }[] {
  const options: { grid: GridState; difficulty: number }[] = [];
  
  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[i % difficulties.length];
    const grid = generateMapWithGeneticAlgorithm(width, height, difficulty);
    const diff = calculateDifficulty(grid);
    options.push({ grid, difficulty: diff });
  }
  
  return options;
}
