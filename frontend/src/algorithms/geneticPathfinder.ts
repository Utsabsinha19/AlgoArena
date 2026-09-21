// ============================================
// AlgoArena - Genetic Algorithm Pathfinding Engine
// ============================================

import { GridState, AlgorithmResult, AlgorithmStep, CELL_COSTS } from '../types';

const DIRECTIONS = [
  { dx: 0, dy: -1 },  // UP
  { dx: 1, dy: 0 },   // RIGHT
  { dx: 0, dy: 1 },   // DOWN
  { dx: -1, dy: 0 },  // LEFT
  { dx: 1, dy: -1 },  // UP-RIGHT
  { dx: 1, dy: 1 },   // DOWN-RIGHT
  { dx: -1, dy: 1 },  // DOWN-LEFT
  { dx: -1, dy: -1 }, // UP-LEFT
];

interface Chromosome {
  genes: number[]; // indices into DIRECTIONS
  fitness: number;
  path: { x: number; y: number }[];
  cost: number;
  reachedGoal: boolean;
}

export function runGeneticPathfinder(
  grid: GridState,
  populationSize = 30,
  generations = 45,
  mutationRate = 0.12,
  crossoverRate = 0.75
): AlgorithmResult {
  const startTime = performance.now();
  const { cells, width, height, start, end } = grid;

  if (!start || !end) {
    return { visited: [], path: [], cost: 0, executionTime: 0, nodesVisited: 0, steps: [] };
  }

  const chromosomeLength = Math.min(width * height, Math.floor(Math.hypot(width, height) * 2.5));
  const visitedSet = new Set<string>();
  const visitedList: { x: number; y: number }[] = [];
  const steps: AlgorithmStep[] = [];

  const isValid = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const type = cells[y][x].type;
    return type !== 'wall' && type !== 'water';
  };

  const evaluateChromosome = (genes: number[]): Chromosome => {
    let currX = start.x;
    let currY = start.y;
    const path: { x: number; y: number }[] = [{ x: currX, y: currY }];
    let cost = 0;
    let reached = false;

    for (let i = 0; i < genes.length; i++) {
      if (currX === end.x && currY === end.y) {
        reached = true;
        break;
      }

      const dir = DIRECTIONS[genes[i]];
      const nx = currX + dir.dx;
      const ny = currY + dir.dy;

      if (!isValid(nx, ny)) {
        // Punish wall collision & stop trajectory
        cost += 50;
        break;
      }

      currX = nx;
      currY = ny;
      path.push({ x: currX, y: currY });
      cost += CELL_COSTS[cells[currY][currX].type] || 1;

      const posKey = `${currX},${currY}`;
      if (!visitedSet.has(posKey)) {
        visitedSet.add(posKey);
        visitedList.push({ x: currX, y: currY });
      }
    }

    if (currX === end.x && currY === end.y) {
      reached = true;
    }

    const distToGoal = Math.hypot(end.x - currX, end.y - currY);
    // Fitness: higher is better
    let fitness = 1000 / (distToGoal + 1);
    if (reached) {
      fitness += 5000 / (cost + 1);
    }

    return {
      genes,
      fitness,
      path,
      cost,
      reachedGoal: reached,
    };
  };

  // Seed biased initial population towards goal direction
  let population: Chromosome[] = [];
  for (let p = 0; p < populationSize; p++) {
    const genes: number[] = [];
    for (let g = 0; g < chromosomeLength; g++) {
      if (Math.random() < 0.4) {
        // Random direction
        genes.push(Math.floor(Math.random() * DIRECTIONS.length));
      } else {
        // Biased direction toward end
        const targetDx = Math.sign(end.x - start.x);
        const targetDy = Math.sign(end.y - start.y);
        const bestDirIdx = DIRECTIONS.findIndex(d => d.dx === targetDx && d.dy === targetDy);
        genes.push(bestDirIdx >= 0 ? bestDirIdx : Math.floor(Math.random() * DIRECTIONS.length));
      }
    }
    population.push(evaluateChromosome(genes));
  }

  let bestChromosome = population[0];

  for (let gen = 0; gen < generations; gen++) {
    // Sort by fitness descending
    population.sort((a, b) => b.fitness - a.fitness);
    if (population[0].fitness > bestChromosome.fitness) {
      bestChromosome = population[0];
    }

    if (steps.length < 350 && population[0].path.length > 0) {
      const leadNode = population[0].path[population[0].path.length - 1];
      steps.push({
        type: 'explore',
        cell: leadNode,
        description: `Gen ${gen + 1}: Top fitness ${population[0].fitness.toFixed(1)} | Path length: ${population[0].path.length}`,
        currentCost: population[0].cost,
        f: population[0].cost + Math.hypot(end.x - leadNode.x, end.y - leadNode.y),
      });
    }

    if (bestChromosome.reachedGoal) break;

    // Next generation
    const nextGen: Chromosome[] = [population[0], population[1]]; // Elitism

    while (nextGen.length < populationSize) {
      // Tournament selection
      const parentA = population[Math.floor(Math.random() * (populationSize / 2))];
      const parentB = population[Math.floor(Math.random() * (populationSize / 2))];

      let childGenes: number[] = [];
      if (Math.random() < crossoverRate) {
        // Crossover
        const splitPoint = Math.floor(Math.random() * chromosomeLength);
        childGenes = [
          ...parentA.genes.slice(0, splitPoint),
          ...parentB.genes.slice(splitPoint),
        ];
      } else {
        childGenes = [...parentA.genes];
      }

      // Mutation
      for (let m = 0; m < childGenes.length; m++) {
        if (Math.random() < mutationRate) {
          childGenes[m] = Math.floor(Math.random() * DIRECTIONS.length);
        }
      }

      nextGen.push(evaluateChromosome(childGenes));
    }

    population = nextGen;
  }

  return {
    visited: visitedList,
    path: bestChromosome.path,
    cost: bestChromosome.cost,
    executionTime: performance.now() - startTime,
    nodesVisited: visitedList.length,
    steps,
  };
}
