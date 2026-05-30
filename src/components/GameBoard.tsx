import React from "react";
import { motion } from "motion/react";
import { Board, Player, BoardTheme } from "../types";

interface GameBoardProps {
  board: Board;
  validMoves: [number, number][];
  currentPlayer: Player;
  onCellClick: (row: number, col: number) => void;
  selectedTheme: BoardTheme;
  showHints: boolean;
  lastMove: [number, number] | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  validMoves,
  currentPlayer,
  onCellClick,
  selectedTheme,
  showHints,
  lastMove,
}) => {
  // Check if a specific cell coordinate is a legal move
  const isCellValid = (r: number, c: number): boolean => {
    return validMoves.some(([vr, vc]) => vr === r && vc === c);
  };

  // Convert letter labels for columns (A-H) and numbers for rows (1-8)
  const COL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const ROW_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8"];

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      {/* Outer wooden-style or futuristic elevated frame */}
      <div className={`w-full h-full rounded-2xl p-4 shadow-2xl flex flex-col justify-between transition-all duration-300 ${selectedTheme.gridBg}`}>
        {/* Top/Side labels are drawn naturally inside the grid layout */}
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1.5 relative">
          
          {/* Main 8x8 squares */}
          {board.map((rowArr, r) =>
            rowArr.map((cellValue, c) => {
              const isValid = isCellValid(r, c);
              const isLast = lastMove && lastMove[0] === r && lastMove[1] === c;

              return (
                <button
                  key={`${r}-${c}`}
                  id={`cell-${r}-${c}`}
                  onClick={() => (isValid ? onCellClick(r, c) : null)}
                  disabled={!isValid}
                  className={`relative aspect-square rounded-[6px] flex items-center justify-center transition-all focus:outline-none select-none group cursor-pointer ${selectedTheme.cellBg} ${
                    isValid ? "cursor-pointer" : "cursor-default"
                  }`}
                  aria-label={`Cell ${COL_LABELS[c]}${ROW_LABELS[r]} ${
                    cellValue ? `contains ${cellValue}` : isValid ? "is valid move" : "is empty"
                  }`}
                >
                  {/* Subtle Grid Coordinates for Corners & Borders to help Othello strategies */}
                  {r === 0 && (
                    <span className="absolute top-1 text-[8px] font-mono opacity-20 pointer-events-none text-white select-none">
                      {COL_LABELS[c]}
                    </span>
                  )}
                  {c === 0 && (
                    <span className="absolute left-1 text-[8px] font-mono opacity-20 pointer-events-none text-white select-none">
                      {ROW_LABELS[r]}
                    </span>
                  )}

                  {/* Corner Marks (Golden Dots / Markers) common to professional Reversi boards */}
                  {((r === 2 || r === 6) && (c === 2 || c === 6)) && (
                    <div className="absolute w-1 h-1 bg-white/20 rounded-full pointer-events-none" />
                  )}

                  {/* Last Move Tracker Ring */}
                  {isLast && (
                    <span className="absolute inset-0 rounded-[6px] border border-amber-400 animate-pulse pointer-events-none z-10 scale-10" />
                  )}

                  {/* Dynamic Playable Disc */}
                  {cellValue && (
                    <motion.div
                      initial={{ scale: 0, rotateY: cellValue === "BLACK" ? 0 : 180 }}
                      animate={{ scale: 1, rotateY: cellValue === "BLACK" ? 0 : 180 }}
                      transition={{
                        type: "spring",
                        stiffness: 150,
                        damping: 15,
                        mass: 0.8
                      }}
                      className={`w-4/5 h-4/5 rounded-full relative ${
                        cellValue === "BLACK" ? selectedTheme.discBlack : selectedTheme.discWhite
                      }`}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Realistic specular gloss overlay for a physical 3D disc representation */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                    </motion.div>
                  )}

                  {/* Valid moves available hint trigger */}
                  {isValid && showHints && (
                    <motion.div
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.5 }}
                      whileHover={{ scale: 1.3, opacity: 0.9 }}
                      className={`w-3.5 h-3.5 rounded-full border border-current transition-colors duration-200 ${
                        currentPlayer === "BLACK" ? "bg-black text-black border-black/40" : "bg-white text-white border-white/40"
                      }`}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
