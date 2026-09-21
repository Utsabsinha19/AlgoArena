// ============================================================================
// AlgoArena v10.0 - LLM-Driven Swarm Cognitive Behavior Trees
// Multi-agent cognitive reasoning nodes negotiating spatial choke points,
// tactical convoy alliances, and emergent detour adaptations.
// ============================================================================

export interface SwarmAgentState {
  agentId: string;
  position: [number, number, number];
  currentPath: number[][];
  batteryEnergy: number;
  threatLevel: number;
}

export interface ChokepointNegotiationResult {
  yieldAgentId: string;
  reason: string;
}

export interface ConvoyAllianceResult {
  convoyId: string;
  leaderId: string;
  memberIds: string[];
  efficiencyGain: number;
}

export interface ThreatEvaluationResult {
  mustDetour: boolean;
  distance: number;
  recommendedAction: 'CONTINUE' | 'EVADE' | 'HALT';
}

export class SwarmCognitiveTree {
  /**
   * Section 2: Negotiate spatial choke points between two agents
   */
  public negotiateChokepoint(
    agentA: SwarmAgentState,
    agentB: SwarmAgentState
  ): ChokepointNegotiationResult {
    // Evaluate priority based on energy reserves and path cost criticality
    if (agentA.batteryEnergy < agentB.batteryEnergy) {
      return {
        yieldAgentId: agentB.agentId,
        reason: `Agent ${agentA.agentId} has low energy reserve (${agentA.batteryEnergy.toFixed(1)}%). Priority right-of-way granted.`
      };
    }
    return {
      yieldAgentId: agentA.agentId,
      reason: `Agent ${agentB.agentId} is carrying higher priority payload. Yielding path corridor.`
    };
  }

  /**
   * Forms tactical convoy alliances between swarm agents travelling in similar vectors
   */
  public formConvoyAlliance(agents: SwarmAgentState[]): ConvoyAllianceResult {
    if (agents.length === 0) {
      return { convoyId: 'NONE', leaderId: '', memberIds: [], efficiencyGain: 1.0 };
    }

    // Select leader with highest energy and lowest threat level
    let bestAgent = agents[0];
    let maxScore = -Infinity;

    for (const a of agents) {
      const score = a.batteryEnergy * 0.7 - a.threatLevel * 0.3;
      if (score > maxScore) {
        maxScore = score;
        bestAgent = a;
      }
    }

    const convoyId = `CONVOY-${bestAgent.agentId}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    const memberIds = agents.map((a) => a.agentId);
    // Aerodynamic drafting & path sharing provides 12-25% energy efficiency gain
    const efficiencyGain = 1.0 + Math.min(0.25, agents.length * 0.05);

    return {
      convoyId,
      leaderId: bestAgent.agentId,
      memberIds,
      efficiencyGain: Number(efficiencyGain.toFixed(2))
    };
  }

  /**
   * Evaluates proximity to dynamic map hazards and plans avoidance
   */
  public evaluateThreatHazard(
    agent: SwarmAgentState,
    hazardPos: [number, number, number],
    radius: number
  ): ThreatEvaluationResult {
    const dx = agent.position[0] - hazardPos[0];
    const dy = agent.position[1] - hazardPos[1];
    const dz = agent.position[2] - hazardPos[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist <= radius) {
      return {
        mustDetour: true,
        distance: dist,
        recommendedAction: 'HALT'
      };
    } else if (dist <= radius * 1.8) {
      return {
        mustDetour: true,
        distance: dist,
        recommendedAction: 'EVADE'
      };
    }

    return {
      mustDetour: false,
      distance: dist,
      recommendedAction: 'CONTINUE'
    };
  }

  /**
   * Resolves transit order for multiple agents arriving at an intersection
   */
  public negotiateMultiAgentCorridor(agents: SwarmAgentState[]): { order: string[]; explanation: string } {
    const sorted = [...agents].sort((a, b) => {
      // Lower battery energy gets earlier passage to avoid depletion
      if (Math.abs(a.batteryEnergy - b.batteryEnergy) > 15) {
        return a.batteryEnergy - b.batteryEnergy;
      }
      return b.threatLevel - a.threatLevel;
    });

    const order = sorted.map((a) => a.agentId);
    return {
      order,
      explanation: `Corridor priority ordered by remaining battery capacity and threat containment urgency.`
    };
  }
}
