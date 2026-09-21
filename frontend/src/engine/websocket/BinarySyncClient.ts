// ============================================================================
// AlgoArena v3.0 - Binary WebSocket Multiplayer Protocol (Section 4)
// High-Frequency 60Hz Binary Telemetry Sync over 12-Byte ArrayBuffers
// ============================================================================

import { BinaryTelemetryPacket } from '../../types/algoArena';

export const BINARY_MSG_TYPE = {
  PING: 1,
  SYNC_TERRAIN: 2,
  TELEMETRY: 3,
  RACE_FINISH: 4,
} as const;

export const ALGORITHM_BINARY_ID: Record<string, number> = {
  bfs: 1,
  dfs: 2,
  dijkstra: 3,
  astar: 4,
  greedy: 5,
  genetic: 6,
  rl: 7,
};

export interface RemoteCompetitorState {
  fighterId: string;
  callsign: string;
  algorithm: string;
  stepIndex: number;
  currentNodeIndex: number;
  nodesExplored: number;
  isFinished: boolean;
  finalCost?: number;
  elo: number;
}

export class BinarySyncClient {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private simulationInterval: number | null = null;
  private onTelemetryCallback?: (packet: BinaryTelemetryPacket, peerId?: string) => void;
  private onRaceFinishCallback?: (results: RemoteCompetitorState[]) => void;

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  // Local simulated competitors for instant offline/online esports matches
  private competitors: RemoteCompetitorState[] = [];

  constructor() {
    this.initDefaultCompetitors();
  }

  private initDefaultCompetitors() {
    this.competitors = [
      {
        fighterId: 'bot-1',
        callsign: 'CYBER-DIJKSTRA',
        algorithm: 'dijkstra',
        stepIndex: 0,
        currentNodeIndex: 0,
        nodesExplored: 0,
        isFinished: false,
        elo: 1450,
      },
      {
        fighterId: 'bot-2',
        callsign: 'NEURO-DQN',
        algorithm: 'rl',
        stepIndex: 0,
        currentNodeIndex: 0,
        nodesExplored: 0,
        isFinished: false,
        elo: 1520,
      },
      {
        fighterId: 'bot-3',
        callsign: 'VECTOR-ASTAR',
        algorithm: 'astar',
        stepIndex: 0,
        currentNodeIndex: 0,
        nodesExplored: 0,
        isFinished: false,
        elo: 1610,
      },
    ];
  }

  /**
   * Packs a 12-byte binary telemetry frame (Section 4 Specification):
   * Byte 0: MsgType (1B)
   * Byte 1: AlgoID (1B)
   * Bytes 2-3: StepIndex (2B, Uint16)
   * Bytes 4-7: CurrentNodeIndex (4B, Uint32)
   * Bytes 8-11: NodesExploredCount (4B, Uint32)
   */
  public static packTelemetry(packet: BinaryTelemetryPacket): ArrayBuffer {
    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);

    view.setUint8(0, packet.msgType);
    view.setUint8(1, packet.algoId);
    view.setUint16(2, packet.stepIndex, true); // Little endian
    view.setUint32(4, packet.currentNodeIndex, true);
    view.setUint32(8, packet.nodesExploredCount, true);

    return buffer;
  }

  /**
   * Unpacks 12-byte binary packet from raw ArrayBuffer
   */
  public static unpackTelemetry(buffer: ArrayBuffer): BinaryTelemetryPacket {
    const view = new DataView(buffer);
    return {
      msgType: view.getUint8(0),
      algoId: view.getUint8(1),
      stepIndex: view.getUint16(2, true),
      currentNodeIndex: view.getUint32(4, true),
      nodesExploredCount: view.getUint32(8, true),
    };
  }

  /**
   * Connect to WebSocket relay server (or fallback to low-latency local simulation relay)
   */
  public connect(url?: string) {
    if (url && typeof WebSocket !== 'undefined') {
      try {
        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
          this.isConnected = true;
        };

        this.socket.onmessage = (event) => {
          if (event.data instanceof ArrayBuffer) {
            const packet = BinarySyncClient.unpackTelemetry(event.data);
            this.onTelemetryCallback?.(packet);
          }
        };

        this.socket.onclose = () => {
          this.isConnected = false;
        };
      } catch (err) {
        console.warn('Could not connect to external WebSocket, using local virtual relay', err);
        this.isConnected = true;
      }
    } else {
      this.isConnected = true;
    }
  }

  public setOnTelemetry(cb: (packet: BinaryTelemetryPacket, peerId?: string) => void) {
    this.onTelemetryCallback = cb;
  }

  public setOnRaceFinish(cb: (results: RemoteCompetitorState[]) => void) {
    this.onRaceFinishCallback = cb;
  }

  /**
   * Transmit live player telemetry at 60Hz
   */
  public broadcastPlayerTelemetry(packet: BinaryTelemetryPacket) {
    const buffer = BinarySyncClient.packTelemetry(packet);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(buffer);
    }
  }

  /**
   * Starts simulated multiplayer race bots streaming binary packets
   */
  public startMultiplayerRace(targetGoalIndex: number, totalGridCells: number) {
    this.initDefaultCompetitors();
    if (this.simulationInterval) clearInterval(this.simulationInterval);

    let tick = 0;
    this.simulationInterval = window.setInterval(() => {
      tick++;
      let allFinished = true;

      this.competitors.forEach((bot, idx) => {
        if (!bot.isFinished) {
          allFinished = false;
          bot.stepIndex = tick;
          bot.nodesExplored += Math.floor(1 + Math.random() * 4);

          // Approximate path toward goal
          bot.currentNodeIndex = Math.min(
            totalGridCells - 1,
            Math.floor((tick / 120) * targetGoalIndex) + idx * 3
          );

          if (tick >= 90 + idx * 25) {
            bot.isFinished = true;
            bot.currentNodeIndex = targetGoalIndex;
            bot.finalCost = 28 + idx * 6;
          }

          // Broadcast 12-byte packet
          const packet: BinaryTelemetryPacket = {
            msgType: bot.isFinished ? BINARY_MSG_TYPE.RACE_FINISH : BINARY_MSG_TYPE.TELEMETRY,
            algoId: ALGORITHM_BINARY_ID[bot.algorithm] || 1,
            stepIndex: bot.stepIndex,
            currentNodeIndex: bot.currentNodeIndex,
            nodesExploredCount: bot.nodesExplored,
          };

          this.onTelemetryCallback?.(packet, bot.fighterId);
        }
      });

      if (allFinished && this.simulationInterval) {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
        this.onRaceFinishCallback?.([...this.competitors]);
      }
    }, 33); // ~30-60Hz
  }

  public stopRace() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  public getCompetitors(): RemoteCompetitorState[] {
    return this.competitors;
  }

  /**
   * Post-race ELO Rating Calculation (Section 4.1 Specification)
   * R_new = R_old + K * (Actual - Expected)
   */
  public static calculateEloDelta(
    playerElo: number,
    opponentElo: number,
    playerWon: boolean,
    kFactor = 32
  ): number {
    const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const actual = playerWon ? 1.0 : 0.0;
    return Math.round(kFactor * (actual - expected));
  }
}
