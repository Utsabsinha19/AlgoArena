// ============================================================================
// AlgoArena v4.0 - Genetic Evolution Engine (Section 1)
// Evolutionary pathfinding via chromosome elitism, tournament selection & mutation
// ============================================================================

import { GridDimensions } from '../../types/algoArena';

export interface Chromosome {
  id: string;
  genes: number[]; // Sequence of directional moves: 0:Up, 1:Right, 2:Down, 3:Left
  fitness: number;
  pathCost: number;
  stepsTaken: number;
  reachedGoal: boolean;
}

export interface GeneticConfig {
  populationSize: number;
  mutationRate: number; // e.g. 0.05 (5%)
  crossoverRate: number; // e.g. 0.80 (80%)
  maxGenerations: number;
  chromosomeLength: number;
  elitismCount: number;
}

export class GeneticEvolutionEngine {
  private population: Chromosome[] = [];
  private generation: number = 0;
  private config: GeneticConfig;
  private dim: GridDimensions;
  private startNode: [number, number];
  private goalNode: [number, number];
  private weights: Float32Array;

  constructor(
    config: GeneticConfig,
    dim: GridDimensions,
    start: [number, number],
    goal: [number, number],
    weights: Float32Array
  ) {
    this.config = config;
    this.dim = dim;
    this.startNode = start;
    this.goalNode = goal;
    this.weights = weights;
    this.initPopulation();
  }

  private initPopulation() {
    this.population = [];
    for (let i = 0; i < this.config.populationSize; i++) {
      const genes: number[] = [];
      for (let j = 0; j < this.config.chromosomeLength; j++) {
        genes.push(Math.floor(Math.random() * 4));
      }
      this.population.push({
        id: `gen0_ind${i}`,
        genes,
        fitness: 0,
        pathCost: 0,
        stepsTaken: 0,
        reachedGoal: false,
      });
    }
  }

  public evaluateFitness(chromosome: Chromosome): number {
    let currX = this.startNode[0];
    let currY = this.startNode[1];
    let totalCost = 0;
    let steps = 0;
    let reached = false;

    for (const gene of chromosome.genes) {
      let nextX = currX;
      let nextY = currY;

      if (gene === 0 && currY > 0) nextY--; // Up
      else if (gene === 1 && currX < this.dim[0] - 1) nextX++; // Right
      else if (gene === 2 && currY < this.dim[1] - 1) nextY++; // Down
      else if (gene === 3 && currX > 0) nextX--; // Left

      const cellIdx = nextY * this.dim[0] + nextX;
      const cellWeight = this.weights[cellIdx];

      if (cellWeight === Infinity || cellWeight >= 999) {
        // Obstacle collision penalty
        totalCost += 50;
      } else {
        currX = nextX;
        currY = nextY;
        totalCost += cellWeight;
        steps++;
      }

      if (currX === this.goalNode[0] && currY === this.goalNode[1]) {
        reached = true;
        break;
      }
    }

    const distToGoal = Math.abs(currX - this.goalNode[0]) + Math.abs(currY - this.goalNode[1]);

    // Mathematical Fitness Function: higher is better
    let fitness = 1000 / (distToGoal + 1);
    if (reached) {
      fitness += 5000 / (totalCost + steps + 1);
    } else {
      fitness -= totalCost * 0.5;
    }

    chromosome.fitness = Math.max(0.1, fitness);
    chromosome.pathCost = totalCost;
    chromosome.stepsTaken = steps;
    chromosome.reachedGoal = reached;

    return chromosome.fitness;
  }

  public stepGeneration(): Chromosome {
    // 1. Evaluate all fitness
    for (const indiv of this.population) {
      this.evaluateFitness(indiv);
    }

    // 2. Sort by fitness descending
    this.population.sort((a, b) => b.fitness - a.fitness);

    const bestIndividual = this.population[0];
    const newPopulation: Chromosome[] = [];

    // 3. Elitism: Carry top performers directly
    for (let i = 0; i < this.config.elitismCount; i++) {
      newPopulation.push({ ...this.population[i], id: `gen${this.generation + 1}_elite${i}` });
    }

    // 4. Crossover & Mutation for remaining
    while (newPopulation.length < this.config.populationSize) {
      const parentA = this.tournamentSelect();
      const parentB = this.tournamentSelect();
      const [childAGenes] = this.crossover(parentA.genes, parentB.genes);

      this.mutate(childAGenes);
      newPopulation.push({
        id: `gen${this.generation + 1}_ind${newPopulation.length}`,
        genes: childAGenes,
        fitness: 0,
        pathCost: 0,
        stepsTaken: 0,
        reachedGoal: false,
      });
    }

    this.population = newPopulation;
    this.generation++;
    return bestIndividual;
  }

  private tournamentSelect(): Chromosome {
    const tournamentSize = 5;
    let best: Chromosome | null = null;
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndiv = this.population[Math.floor(Math.random() * this.population.length)];
      if (!best || randomIndiv.fitness > best.fitness) {
        best = randomIndiv;
      }
    }
    return best!;
  }

  private crossover(genesA: number[], genesB: number[]): [number[], number[]] {
    if (Math.random() > this.config.crossoverRate) {
      return [[...genesA], [...genesB]];
    }
    const point = Math.floor(Math.random() * genesA.length);
    const childA = genesA.slice(0, point).concat(genesB.slice(point));
    const childB = genesB.slice(0, point).concat(genesA.slice(point));
    return [childA, childB];
  }

  private mutate(genes: number[]) {
    for (let i = 0; i < genes.length; i++) {
      if (Math.random() < this.config.mutationRate) {
        genes[i] = Math.floor(Math.random() * 4);
      }
    }
  }

  public getGenerationCount(): number {
    return this.generation;
  }

  public getBestIndividual(): Chromosome {
    return this.population[0];
  }

  public getPopulation(): Chromosome[] {
    return this.population;
  }

  public runToCompletion(): { best: Chromosome; generationsRun: number } {
    let best = this.population[0];
    for (let g = 0; g < this.config.maxGenerations; g++) {
      best = this.stepGeneration();
      if (best.reachedGoal) break;
    }
    return { best, generationsRun: this.generation };
  }

  public getChromosomePath(chromosome: Chromosome): { x: number; y: number }[] {
    let currX = this.startNode[0];
    let currY = this.startNode[1];
    const path: { x: number; y: number }[] = [{ x: currX, y: currY }];

    for (const gene of chromosome.genes) {
      let nextX = currX;
      let nextY = currY;

      if (gene === 0 && currY > 0) nextY--;
      else if (gene === 1 && currX < this.dim[0] - 1) nextX++;
      else if (gene === 2 && currY < this.dim[1] - 1) nextY++;
      else if (gene === 3 && currX > 0) nextX--;

      const cellIdx = nextY * this.dim[0] + nextX;
      const cellWeight = this.weights[cellIdx];
      if (cellWeight === Infinity || cellWeight >= 999) break;

      currX = nextX;
      currY = nextY;
      path.push({ x: currX, y: currY });

      if (currX === this.goalNode[0] && currY === this.goalNode[1]) break;
    }

    return path;
  }
}
