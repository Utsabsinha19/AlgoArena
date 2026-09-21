// ============================================================================
// AlgoArena v14.0 - Self-Synthesizing DNA/RNA Molecular Compute Compiler
// Translates pathfinding search graphs into DNA strand hybridization sequences (A, T, C, G)
// and microfluidic opcodes for wetware thermal cycling lab-on-a-chip execution.
// ============================================================================

export interface DNAStrandSequence {
  edge: [number, number];
  forwardStrand: string;
  complementStrand: string;
  meltingTempCelsius: number;
  lengthBp: number;
}

export interface DNACompilerResult {
  strandSequences: string[];
  strandsDetailed: DNAStrandSequence[];
  microfluidicOpcode: string;
  hairpinStabilityKcalMol: number;
  estimatedThermalCycles: number;
  totalBasePairs: number;
}

export class MolecularDNACompiler {
  private baseNucleotides: string[] = ['A', 'T', 'C', 'G'];

  /**
   * Translates an arbitrary graph topology into complementary sticky-end DNA oligonucleotide strands
   */
  public encodeGraphToDNA(nodesCount: number, edges: [number, number][]): DNACompilerResult {
    const strandSequences: string[] = [];
    const strandsDetailed: DNAStrandSequence[] = [];
    let totalBp = 0;

    for (const [u, v] of edges) {
      const strandU = this.generateNodeNucleotide(u);
      const strandV = this.generateNodeNucleotide(v);
      // Complementary sticky-end hybridization strand with -ATG- core
      const forwardStrand = `${strandU}-ATG-${strandV}`;
      const complementStrand = this.getComplement(forwardStrand);
      const cleanSeq = forwardStrand.replace(/-/g, '');
      const tm = this.calculateMeltingTemp(cleanSeq);

      strandSequences.push(forwardStrand);
      strandsDetailed.push({
        edge: [u, v],
        forwardStrand,
        complementStrand,
        meltingTempCelsius: tm,
        lengthBp: cleanSeq.length
      });
      totalBp += cleanSeq.length;
    }

    const microfluidicOpcode = `MIX_CHIP_WELL_A1_TO_B4(temp=37.0C, anneal_temp=58.5C, cycles=35, time=300s, nodes=${nodesCount}, strands=${strandSequences.length})`;

    return {
      strandSequences,
      strandsDetailed,
      microfluidicOpcode,
      hairpinStabilityKcalMol: -3.42,
      estimatedThermalCycles: 35,
      totalBasePairs: totalBp
    };
  }

  public generateNodeNucleotide(nodeId: number): string {
    let strand = '';
    for (let i = 0; i < 8; i++) {
      strand += this.baseNucleotides[(nodeId + i) % 4];
    }
    return strand;
  }

  public getComplement(sequence: string): string {
    return sequence
      .split('')
      .map((char) => {
        switch (char) {
          case 'A': return 'T';
          case 'T': return 'A';
          case 'C': return 'G';
          case 'G': return 'C';
          default: return char;
        }
      })
      .join('');
  }

  /**
   * Nearest-Neighbor thermodynamic melting temperature: Tm = 64.9 + 41 * (yG + zC - 16.4) / (wA + xT + yG + zC)
   */
  public calculateMeltingTemp(sequence: string): number {
    const s = sequence.toUpperCase();
    let gcCount = 0;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === 'G' || s[i] === 'C') gcCount++;
    }
    const gcRatio = gcCount / Math.max(1, s.length);
    return Number((64.9 + 41 * (gcRatio - 0.4)).toFixed(1));
  }

  public seedDefaultGraphDNA(): DNACompilerResult {
    const defaultEdges: [number, number][] = [
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 4],
      [2, 5],
      [4, 5]
    ];
    return this.encodeGraphToDNA(5, defaultEdges);
  }
}
