// ============================================================================
// AlgoArena v3.0 - Multiplayer Esports Arena & Binary Sync Modal (Section 4)
// Draft Phase, 60Hz 12-Byte Binary Telemetry Stream, and ELO Rank Updates
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { BinarySyncClient, RemoteCompetitorState } from '../../engine/websocket/BinarySyncClient';
import { FIGHTER_PROFILES, AlgorithmType } from '../../types';
import { FighterSelectCard } from '../hud/FighterSelectCard';
import { webAudioEngine } from '../../engine/audio/WebAudioEngine';

interface MultiplayerArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySeedMap?: (seed: number) => void;
}

export const MultiplayerArenaModal: React.FC<MultiplayerArenaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [phase, setPhase] = useState<'draft' | 'countdown' | 'racing' | 'results'>('draft');
  const [selectedSquad, setSelectedSquad] = useState<AlgorithmType[]>(['astar', 'dijkstra', 'rl']);
  const [countdown, setCountdown] = useState<number>(3);
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [playerNodes, setPlayerNodes] = useState<number>(0);
  const [playerElo, setPlayerElo] = useState<number>(1500);
  const [eloDelta, setEloDelta] = useState<number>(0);
  const [competitors, setCompetitors] = useState<RemoteCompetitorState[]>([]);
  const [binaryPacketsReceived, setBinaryPacketsReceived] = useState<number>(0);

  const clientRef = useRef<BinarySyncClient | null>(null);

  useEffect(() => {
    if (!isOpen) {
      clientRef.current?.stopRace();
      setPhase('draft');
      return;
    }

    const client = new BinarySyncClient();
    clientRef.current = client;
    client.connect();

    client.setOnTelemetry((packet) => {
      setBinaryPacketsReceived((prev) => prev + 1);
      setCompetitors([...client.getCompetitors()]);

      // Sonify high-speed remote competitor telemetry
      if (packet.stepIndex % 6 === 0) {
        webAudioEngine.playNodeExpansionSound(
          packet.currentNodeIndex % 25,
          25,
          Math.min(packet.stepIndex, 30)
        );
      }
    });

    client.setOnRaceFinish((results) => {
      // Calculate ELO update
      const avgBotElo = results.reduce((acc, c) => acc + c.elo, 0) / results.length;
      const playerWon = true; // In demo race
      const delta = BinarySyncClient.calculateEloDelta(playerElo, avgBotElo, playerWon);
      setEloDelta(delta);
      setPlayerElo((prev) => prev + delta);
      setPhase('results');
      webAudioEngine.playVictoryStinger();
    });

    return () => {
      client.stopRace();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSquadMember = (algo: AlgorithmType) => {
    if (selectedSquad.includes(algo)) {
      if (selectedSquad.length > 1) {
        setSelectedSquad(selectedSquad.filter((a) => a !== algo));
      }
    } else {
      if (selectedSquad.length < 3) {
        setSelectedSquad([...selectedSquad, algo]);
      }
    }
  };

  const handleStartRace = () => {
    setPhase('countdown');
    setCountdown(3);
    setBinaryPacketsReceived(0);

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('racing');
          startLiveRace();
          return 0;
        }
        return prev - 1;
      });
    }, 800);
  };

  const startLiveRace = () => {
    if (!clientRef.current) return;
    clientRef.current.startMultiplayerRace(480, 500);

    // Simulate player search progress alongside remote bots
    let pStep = 0;
    const playerInterval = window.setInterval(() => {
      pStep++;
      setPlayerProgress(Math.min(100, Math.floor((pStep / 75) * 100)));
      setPlayerNodes((prev) => prev + 4);

      if (pStep >= 75) {
        clearInterval(playerInterval);
      }
    }, 33);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(0,255,255,0.18)] p-6 text-white font-mono">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-cyan-300">
                MULTIPLAYER ESPORTS ARENA
              </h2>
              <p className="text-xs text-slate-400">
                v3.0 12-Byte Packed Binary Telemetry & ELO Ranked Circuit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all text-xs"
          >
            ✕ ESC
          </button>
        </div>

        {/* Phase 1: Squad Draft */}
        {phase === 'draft' && (
          <div className="py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-200">
                  PHASE 1: DRAFT YOUR ALGORITHM SQUAD (Select 3)
                </h3>
                <p className="text-xs text-slate-400">
                  Chosen fighters will compete in the deterministic seed relay tournament.
                </p>
              </div>
              <div className="px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-bold">
                Squad: {selectedSquad.length} / 3 Selected
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(FIGHTER_PROFILES).slice(0, 6).map((fighter) => (
                <FighterSelectCard
                  key={fighter.id}
                  fighter={fighter}
                  isSelected={selectedSquad.includes(fighter.id)}
                  onSelect={() => toggleSquadMember(fighter.id)}
                  eloRating={fighter.id === 'astar' ? 1650 : fighter.id === 'rl' ? 1580 : 1500}
                />
              ))}
            </div>

            {/* Ready Button */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleStartRace}
                disabled={selectedSquad.length === 0}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-bold uppercase tracking-wider text-sm shadow-[0_0_25px_rgba(0,255,255,0.4)] transition-all disabled:opacity-50"
              >
                LOCK SQUAD & ENTER RACE »
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Countdown */}
        {phase === 'countdown' && (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
              SYNCHRONIZING DETERMINISTIC TERRAIN SEED...
            </div>
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            <p className="text-xs text-slate-500">Launching client Web Workers across 60Hz Binary Sync</p>
          </div>
        )}

        {/* Phase 3: Racing Live Stream */}
        {phase === 'racing' && (
          <div className="py-6 space-y-6">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-emerald-300 uppercase">BINARY TELEMETRY STREAM ACTIVE</span>
              </div>
              <div className="text-slate-400">
                Packets: <span className="text-cyan-400 font-bold">{binaryPacketsReceived}</span> (12 Bytes/pkt)
              </div>
            </div>

            {/* Competitor Race Bars */}
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              {/* Player */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-300 font-bold">★ YOU ({selectedSquad[0]?.toUpperCase()})</span>
                  <span className="text-slate-400">{playerProgress}% | {playerNodes} nodes</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-75"
                    style={{ width: `${playerProgress}%` }}
                  />
                </div>
              </div>

              {/* Remote Competitors */}
              {competitors.map((bot) => {
                const percent = Math.min(100, Math.floor((bot.stepIndex / 95) * 100));
                return (
                  <div key={bot.fighterId} className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-300 font-medium">⚡ {bot.callsign} [ELO {bot.elo}]</span>
                      <span className="text-slate-400">{percent}% | {bot.nodesExplored} nodes</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-75"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-300 flex items-center gap-2">
              <span className="text-lg">📡</span>
              <span>
                Streaming packed 12-byte telemetry packets with zero main-thread render stalls.
              </span>
            </div>
          </div>
        )}

        {/* Phase 4: Results & ELO Update */}
        {phase === 'results' && (
          <div className="py-6 space-y-6 text-center">
            <div className="inline-block p-4 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-4xl mb-2">
              🏆
            </div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 uppercase">
              RACE CONCLUDED - VICTORY!
            </h3>
            <p className="text-xs text-slate-400">
              Optimal path calculated in record velocity across the tournament grid.
            </p>

            {/* ELO Rating Badge */}
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-900 border border-cyan-500/30 my-2">
              <div className="text-left">
                <div className="text-[10px] uppercase text-slate-400">YOUR NEW ELO RATING</div>
                <div className="text-2xl font-bold text-cyan-300">{playerElo}</div>
              </div>
              <div className="text-emerald-400 text-sm font-bold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                +{eloDelta} ELO
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => setPhase('draft')}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs uppercase tracking-wider font-semibold transition-all"
              >
                Draft New Squad
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs uppercase tracking-wider font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.4)]"
              >
                Return to Arena
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
