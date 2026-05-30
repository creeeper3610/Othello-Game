import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameBoard } from "./components/GameBoard";
import { ScoreBoard } from "./components/ScoreBoard";
import { OthelloRules } from "./components/OthelloRules";
import { createInitialBoard, getValidMoves, makeMove, getScores, getCPUMove } from "./lib/othelloLogic";
import { BOARD_THEMES } from "./lib/themePresets";
import { Player, GameMode, Difficulty, BoardThemeId, HistoryEntry } from "./types";
import { Trophy, Compass, Sparkles, RefreshCw, Volume2, VolumeX, Eye } from "lucide-react";

export default function App() {
  // Game Play States
  const [board, setBoard] = useState(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("BLACK");
  const [gameMode, setGameMode] = useState<GameMode>("PVP");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [selectedThemeId, setSelectedThemeId] = useState<BoardThemeId>("EMERALD");
  const [showHints, setShowHints] = useState(true);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  
  // Game Flow States
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isCPUThinking, setIsCPUThinking] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [gameNotification, setGameNotification] = useState<string | null>(null);
  const [gameNotificationType, setGameNotificationType] = useState<"pass" | "info">("info");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Context synth references for tactile thuds during disk placements
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play a simple synthesized physical thud/click for disk placement
  const triggerPlacingAudioEffect = (pitchMultiplier = 1) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(150 * pitchMultiplier, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40 * pitchMultiplier, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Quietly bypass standard sandboxed browser limitations if AudioContext is blocked
    }
  };

  // Score details
  const scores = getScores(board);

  // Theme Object
  const currentTheme = BOARD_THEMES.find((t) => t.id === selectedThemeId) || BOARD_THEMES[0];

  // List of valid moves for current player
  const validMoves = getValidMoves(board, currentPlayer);

  // Determine game state status flags
  const hasValidMovesThisTurn = validMoves.length > 0;
  const isOpponentValidMovesAvailable = getValidMoves(board, currentPlayer === "BLACK" ? "WHITE" : "BLACK").length > 0;
  
  // Check if both parties have ran out of legal moves
  const isGameOver = !hasValidMovesThisTurn && !isOpponentValidMovesAvailable;

  // Derive Winner
  let winner: Player | "DRAW" | null = null;
  if (isGameOver) {
    if (scores.BLACK > scores.WHITE) winner = "BLACK";
    else if (scores.WHITE > scores.BLACK) winner = "WHITE";
    else winner = "DRAW";
  }

  // Trigger automated alerts/notifications briefly
  const showFlashMessage = (msg: string, type: "pass" | "info" = "info") => {
    setGameNotification(msg);
    setGameNotificationType(type);
    setTimeout(() => setGameNotification(null), 3000);
  };

  // Restart the current game
  const handleRestart = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer("BLACK");
    setHistory([]);
    setLastMove(null);
    setIsCPUThinking(false);
    triggerPlacingAudioEffect(1.2);
    showFlashMessage("New match initialized. Black plays first!", "info");
  };

  // Undo structural action
  const handleUndo = () => {
    if (history.length === 0) return;
    
    // In CPU mode, we should take back TWO turns (both the CPU move AND player's move)
    // so the state lands correctly on the player's prior turn.
    if (gameMode === "CPU") {
      if (history.length >= 2) {
        // Pop twice
        const priorEntry = history[history.length - 2];
        setBoard(priorEntry.board);
        setCurrentPlayer(priorEntry.currentPlayer);
        setHistory(history.slice(0, -2));
        setLastMove(null);
        triggerPlacingAudioEffect(0.85);
        showFlashMessage("Undid current turn and Computer's turn", "info");
      } else {
        // fallback to restarting
        handleRestart();
      }
    } else {
      // In local PvP, take back single turn
      const priorEntry = history[history.length - 1];
      setBoard(priorEntry.board);
      setCurrentPlayer(priorEntry.currentPlayer);
      setHistory(history.slice(0, -1));
      setLastMove(null);
      triggerPlacingAudioEffect(0.85);
      showFlashMessage(`Undid ${currentPlayer === "BLACK" ? "White's" : "Black's"} move`, "info");
    }
  };

  // Handle cell click placement by a physical player
  const handleCellClick = (r: number, c: number) => {
    if (isCPUThinking || isGameOver) return;
    
    // Save state entry inside history logs of undo before we change Board
    const currentEntry: HistoryEntry = {
      board: board,
      currentPlayer: currentPlayer,
      score: { ...scores }
    };
    
    // Place current piece and execute flips
    const nextBoard = makeMove(board, r, c, currentPlayer);
    const nextScores = getScores(nextBoard);
    
    // Check next player's status
    const opponent: Player = currentPlayer === "BLACK" ? "WHITE" : "BLACK";
    const opponentMoves = getValidMoves(nextBoard, opponent);
    const currentMoves = getValidMoves(nextBoard, currentPlayer);

    triggerPlacingAudioEffect(1);

    // Decoupled board updating to prevent synchronous lagging
    setBoard(nextBoard);
    setLastMove([r, c]);
    setHistory((prev) => [...prev, currentEntry]);

    if (opponentMoves.length > 0) {
      // Opponent gets the turn next
      setCurrentPlayer(opponent);
    } else if (currentMoves.length > 0) {
      // Opponent has no valid moves, they pass back to current player
      showFlashMessage(`${opponent === "BLACK" ? "黒" : "白"}は有効な手がありません。パス！`, "pass");
      // Current player continues
    } else {
      // Game over state triggers
    }
  };

  // Automatic Computer AI hook
  useEffect(() => {
    if (gameMode === "CPU" && currentPlayer === "WHITE" && !isGameOver) {
      const cpuMoves = getValidMoves(board, "WHITE");
      if (cpuMoves.length === 0) {
        // CPU has no available moves. Auto-pass back to Player
        showFlashMessage("コンピュータは有効な手がないため、パスします！", "pass");
        setCurrentPlayer("BLACK");
        return;
      }

      // Simulate a natural human-like visual CPU placement delay (750ms)
      setIsCPUThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getCPUMove(board, "WHITE", difficulty);
        if (aiMove) {
          const [ar, ac] = aiMove;
          
          // Capture current state to history logs
          const currentEntry: HistoryEntry = {
            board: board,
            currentPlayer: "WHITE",
            score: { ...scores }
          };

          // Process AI disc position placement
          const nextBoard = makeMove(board, ar, ac, "WHITE");
          const userMoves = getValidMoves(nextBoard, "BLACK");
          const nextCpuMoves = getValidMoves(nextBoard, "WHITE");

          triggerPlacingAudioEffect(0.95);
          setBoard(nextBoard);
          setLastMove([ar, ac]);
          setHistory((prev) => [...prev, currentEntry]);

          if (userMoves.length > 0) {
            setCurrentPlayer("BLACK");
          } else if (nextCpuMoves.length > 0) {
            // Player is passed. CPU plays again
            showFlashMessage("あなたの手番がありません。パス。コンピュータが続けて打ちます！", "pass");
          }
        }
        setIsCPUThinking(false);
      }, 750);

      return () => clearTimeout(timer);
    }
  }, [board, currentPlayer, gameMode, difficulty, isGameOver]);

  // Handle Double Pass or Game Over check alerts
  useEffect(() => {
    if (!isGameOver && !hasValidMovesThisTurn && isOpponentValidMovesAvailable) {
      // Automatically skip current player because they have no legal slots
      showFlashMessage(`${currentPlayer === "BLACK" ? "黒" : "白"}は有効に手をおけません。パス！`, "pass");
      const nextPPlayer = currentPlayer === "BLACK" ? "WHITE" : "BLACK";
      setCurrentPlayer(nextPPlayer);
    }
  }, [currentPlayer, isGameOver, hasValidMovesThisTurn, isOpponentValidMovesAvailable]);

  return (
    <div className="min-h-screen bg-slate-950 text-zinc-100 font-sans relative selection:bg-indigo-500/30 selection:text-white transition-all overflow-y-auto">
      
      {/* Decorative stars / geometric patterns backing the clean interface */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Main Container - Desktop-First responsive board view */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 md:py-10 flex flex-col min-h-screen">
        
        {/* Header Block */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.2 bg-gradient-to-br from-amber-400 to-indigo-600 rounded-xl shadow-lg border border-indigo-650/40">
              <Trophy className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-wider text-white uppercase flex items-center gap-2">
                Othello <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono lowercase tracking-normal border border-indigo-500/30">v1.1</span>
              </h1>
              <p className="text-xs text-zinc-400 font-medium">
                High-contrast Reversi classic with smart algorithmic local CPU
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Audio Toggle button */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                triggerPlacingAudioEffect(1.15);
              }}
              className="p-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-400 hover:text-white cursor-pointer transition-all active:scale-95"
              title={soundEnabled ? "Mute placing audio" : "Unmute placing audio"}
              aria-label="Toggle audio effects"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Rules Overlay button */}
            <button
              onClick={() => setIsRulesOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95"
              aria-label="View Othello tutorial handbook"
            >
              <Compass className="w-4 h-4" />
              <span>ルール解説</span>
            </button>
          </div>
        </header>

        {/* Dynamic Floating Action Pass Alerts */}
        <AnimatePresence>
          {gameNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="w-full max-w-sm mx-auto mb-4 z-40 fixed top-6 left-1/2 -translate-x-1/2"
            >
              <div className={`p-3.5 rounded-xl flex items-center gap-3 shadow-2xl border ${
                gameNotificationType === "pass"
                  ? "bg-slate-900/95 border-amber-500/40 text-amber-300"
                  : "bg-slate-900/95 border-indigo-500/40 text-indigo-300"
              }`}>
                <Sparkles className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                <span className="text-xs font-bold font-mono tracking-wide leading-snug">{gameNotification}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Row - Board + Control Center */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
          
          {/* Left Column: Gameboard with aesthetic themes picker beneath (8 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* The interactive board component */}
            <GameBoard
              board={board}
              validMoves={validMoves}
              currentPlayer={currentPlayer}
              onCellClick={handleCellClick}
              selectedTheme={currentTheme}
              showHints={showHints}
              lastMove={lastMove}
            />

            {/* Aesthetics & Stylistic board theme toggler */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                Board Theme Preset
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {BOARD_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedThemeId(theme.id);
                      triggerPlacingAudioEffect(1.05);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      selectedThemeId === theme.id
                        ? "bg-white text-black border-white"
                        : "bg-black/30 text-zinc-400 border-zinc-800/80 hover:text-white"
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Score counters, Undo capabilities and AI configurations (5 cols) */}
          <div className="lg:col-span-5">
            <ScoreBoard
              blackCount={scores.BLACK}
              whiteCount={scores.WHITE}
              currentPlayer={currentPlayer}
              gameMode={gameMode}
              difficulty={difficulty}
              isCPUThinking={isCPUThinking}
              isGameOver={isGameOver}
              historyLength={history.length}
              winner={winner}
              showHints={showHints}
              onToggleHints={() => setShowHints(!showHints)}
              onUndo={handleUndo}
              onRestart={handleRestart}
              onChangeMode={(mode) => {
                setGameMode(mode);
                handleRestart();
                showFlashMessage(`Mode switched to ${mode === "CPU" ? "Computer Opponent" : "Local pass and play"}!`, "info");
              }}
              onChangeDifficulty={(diff) => {
                setDifficulty(diff);
                handleRestart();
                showFlashMessage(`Bot difficulty set to ${diff}!`, "info");
              }}
            />
          </div>
        </div>

        {/* Footer info banner */}
        <footer className="mt-auto pt-8 pb-4 text-center text-xs text-zinc-500 font-mono tracking-wider flex flex-col md:flex-row items-center justify-between gap-3 border-t border-zinc-900">
          <span>
            Othello / Reversi Tabletop Companion
          </span>
          <span className="text-[10px] text-zinc-600 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-900">
            Secure client-side algorithm offline game • No external AI queries
          </span>
        </footer>

        {/* Japanese Tutorial Rule drawer */}
        <OthelloRules isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      </div>
    </div>
  );
}
