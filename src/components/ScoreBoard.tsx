import React from "react";
import { Undo, RotateCcw, AlertTriangle, Cpu, Users, Eye, EyeOff } from "lucide-react";
import { Player, GameMode, Difficulty } from "../types";

interface ScoreBoardProps {
  blackCount: number;
  whiteCount: number;
  currentPlayer: Player;
  gameMode: GameMode;
  difficulty: Difficulty;
  isCPUThinking: boolean;
  isGameOver: boolean;
  historyLength: number;
  winner: Player | "DRAW" | null;
  showHints: boolean;
  onToggleHints: () => void;
  onUndo: () => void;
  onRestart: () => void;
  onChangeMode: (mode: GameMode) => void;
  onChangeDifficulty: (difficulty: Difficulty) => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  blackCount,
  whiteCount,
  currentPlayer,
  gameMode,
  difficulty,
  isCPUThinking,
  isGameOver,
  historyLength,
  winner,
  showHints,
  onToggleHints,
  onUndo,
  onRestart,
  onChangeMode,
  onChangeDifficulty,
}) => {
  const totalDiscs = blackCount + whiteCount;
  // Calculate percentage coverage for the fluid ratio bar
  const blackPercentage = totalDiscs > 0 ? (blackCount / totalDiscs) * 100 : 50;
  const whitePercentage = totalDiscs > 0 ? (whiteCount / totalDiscs) * 100 : 50;

  // Mode configurations
  const isBlackTurn = currentPlayer === "BLACK";

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Game Mode Selector Card */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex flex-col gap-3">
        <label className="text-xs uppercase font-semibold font-mono tracking-wider text-zinc-500">
          Game Setup Mode
        </label>
        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl">
          <button
            onClick={() => onChangeMode("PVP")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              gameMode === "PVP"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pass & Play</span>
          </button>
          <button
            onClick={() => onChangeMode("CPU")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              gameMode === "CPU"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>vs Computer</span>
          </button>
        </div>

        {/* Difficulty Selection (only shown for CPU) */}
        {gameMode === "CPU" && (
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-[10px] uppercase font-bold font-mono tracking-wider text-zinc-500">
              Bot Difficulty Evaluation
            </label>
            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-lg">
              {(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => onChangeDifficulty(level)}
                  className={`py-1 px-2 rounded-md text-[11px] font-bold uppercase transition-all ${
                    difficulty === level
                      ? level === "EASY"
                        ? "bg-green-600 text-white font-black"
                        : level === "MEDIUM"
                        ? "bg-amber-600 text-white font-black"
                        : "bg-red-600 text-white font-black"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {level === "EASY" ? "Easy" : level === "MEDIUM" ? "Medium" : "Hard"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Scoreboard Counters & Proportion Meter */}
      <div className="p-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
        
        {/* Glow indicator based on whose turn it is */}
        {!isGameOver && (
          <div
            className={`absolute top-0 inset-x-0 h-1 transition-all duration-500 ${
              isBlackTurn ? "bg-amber-400 shadow-[0_0_10px_#f59e0b]" : "bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
            }`}
          />
        )}

        {/* Players Score Rows */}
        <div className="grid grid-cols-2 gap-4">
          {/* BLACK Score block */}
          <div
            className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
              isBlackTurn && !isGameOver
                ? "bg-[#18181b] border-2 border-amber-400/40 shadow-inner scale-[1.03]"
                : "bg-[#18181b]/40 border border-transparent"
            }`}
          >
            {/* Real disc likeness inside score indicator */}
            <div className="w-8 h-8 rounded-full bg-radial from-neutral-700 to-black shadow-md border border-black flex items-center justify-center mb-1.5" />
            
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest text-center">
              Black {gameMode === "CPU" ? "(Player)" : "(P1)"}
            </span>
            <span className="text-2xl font-black font-mono mt-0.5 text-white">
              {blackCount}
            </span>
          </div>

          {/* WHITE Score block */}
          <div
            className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
              !isBlackTurn && !isGameOver
                ? "bg-[#18181b] border-2 border-cyan-400/40 shadow-inner scale-[1.03]"
                : "bg-[#18181b]/30 border border-transparent"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-radial from-zinc-100 to-neutral-300 shadow-md border border-neutral-200 flex items-center justify-center mb-1.5" />
            
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest text-center">
              White {gameMode === "CPU" ? `(Bot ${difficulty})` : "(P2)"}
            </span>
            <span className="text-2xl font-black font-mono mt-0.5 text-white">
              {whiteCount}
            </span>
          </div>
        </div>

        {/* Dynamic Proportion Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-mono text-zinc-500 px-0.5">
            <span>Black {Math.round(blackPercentage)}%</span>
            <span>White {Math.round(whitePercentage)}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-zinc-800 flex overflow-hidden border border-zinc-950">
            <div
              style={{ width: `${blackPercentage}%` }}
              className="h-full bg-amber-400 transition-all duration-500 ease-out shadow-[0_0_8px_#f59e0b]"
            />
            <div
              style={{ width: `${whitePercentage}%` }}
              className="h-full bg-cyan-400 transition-all duration-500 ease-out shadow-[0_0_8px_#22d3ee]"
            />
          </div>
        </div>

        {/* CPU Thinking overlay indicator */}
        {gameMode === "CPU" && isCPUThinking && !isGameOver && (
          <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs py-1 border border-indigo-900/30 bg-indigo-950/20 rounded-lg animate-pulse">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>AI Bot is planning next move...</span>
          </div>
        )}

        {/* Game Winner/Over Banner */}
        {isGameOver && (
          <div className="flex flex-col items-center justify-center p-3 text-center rounded-xl bg-indigo-950/20 border border-indigo-900/40">
            <h3 className="text-sm font-bold tracking-widest uppercase text-amber-400">
              GAME OVER
            </h3>
            <p className="text-xs text-indigo-200 mt-1">
              {winner === "DRAW" ? (
                "It's a Draw! Amazing Match!"
              ) : (
                <>
                  <span className={winner === "BLACK" ? "text-amber-400 font-bold" : "text-cyan-400 font-bold"}>
                    {winner}
                  </span>{" "}
                  {winner === "BLACK" ? "wins this round" : "wins this round"} ({winner === "BLACK" ? blackCount : whiteCount} vs {winner === "BLACK" ? whiteCount : blackCount})!
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Control Utility Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={historyLength === 0 || isCPUThinking}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-904 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-zinc-500 cursor-pointer disabled:cursor-not-allowed transition-all"
          title="Take back one turn"
          aria-label="Undo move"
        >
          <Undo className="w-4 h-4" />
          <span>Undo ({historyLength})</span>
        </button>

        {/* Hints Toggler */}
        <button
          onClick={onToggleHints}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
            showHints
              ? "bg-indigo-950/30 border-indigo-700/50 text-indigo-300 hover:bg-indigo-950/50"
              : "bg-zinc-904 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
          }`}
          title="Toggle legal move dots"
          aria-label="Toggle valid moves advice"
        >
          {showHints ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span>Hints: {showHints ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* Restart Button */}
      <button
        onClick={onRestart}
        className="flex items-center justify-center gap-2 py-3 w-full rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-100 hover:bg-white text-black active:scale-98 cursor-pointer shadow-lg transition-all"
        aria-label="Restart match"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Restart Match</span>
      </button>
    </div>
  );
};
