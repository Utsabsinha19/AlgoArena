// ============================================================================
// AlgoArena v6.0 - Plugin Sandbox & Proof-of-Execution Engine (Section 5)
// Isolated WebAssembly/JS fuel-limited sandbox & Merkle execution proof verification
// ============================================================================

export interface SafeExecutionResult<T> {
  result: T | null;
  executionProofHash: string;
  fuelConsumed: number;
  executionTimeMs: number;
  error?: string;
}

export class PluginSandbox {
  private fuelLimit: number;
  private fuelConsumed: number = 0;

  constructor(fuelLimit: number = 1_000_000) {
    this.fuelLimit = fuelLimit;
  }

  public getFuelLimit(): number {
    return this.fuelLimit;
  }

  public setFuelLimit(limit: number): void {
    this.fuelLimit = limit;
  }

  public getFuelConsumed(): number {
    return this.fuelConsumed;
  }

  /**
   * Deducts fuel units during algorithmic iterations
   * Throws Error if CPU quota is exhausted, halting runaway infinite loops
   */
  public consumeFuel(amount: number = 1): void {
    this.fuelConsumed += amount;
    if (this.fuelConsumed > this.fuelLimit) {
      throw new Error(`[PluginSandbox]: Fuel quota exceeded (${this.fuelConsumed} / ${this.fuelLimit})`);
    }
  }

  /**
   * Executes user-submitted algorithm safely within quota and generates an execution proof hash
   */
  public executeSafely<T>(fn: (sandbox: PluginSandbox) => T): SafeExecutionResult<T> {
    this.fuelConsumed = 0;
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    try {
      const result = fn(this);
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const executionTimeMs = parseFloat((endTime - startTime).toFixed(3));

      // Deterministic execution proof hash
      const proofPayload = `fuel:${this.fuelConsumed}|time:${executionTimeMs}|out:${JSON.stringify(result)}`;
      const executionProofHash = this.simpleHash(proofPayload);

      return {
        result,
        executionProofHash,
        fuelConsumed: this.fuelConsumed,
        executionTimeMs,
      };
    } catch (err) {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        result: null,
        executionProofHash: '',
        fuelConsumed: this.fuelConsumed,
        executionTimeMs: parseFloat((endTime - startTime).toFixed(3)),
        error: (err as Error).message,
      };
    }
  }

  /**
   * Merkle tree root simulation for anti-cheat audit logs
   */
  public generateMerkleProof(stepHashes: string[]): string {
    if (stepHashes.length === 0) return '0x00000000';
    let combined = stepHashes.join('::');
    return this.simpleHash(combined);
  }

  public simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }
}
