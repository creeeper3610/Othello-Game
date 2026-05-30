export type Player = "BLACK" | "WHITE";
export type Cell = Player | null;
export type Board = Cell[][]; // 8x8 grid of Reversi cells

export type GameMode = "PVP" | "CPU";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface HistoryEntry {
  board: Board;
  currentPlayer: Player;
  score: { BLACK: number; WHITE: number };
}

export type BoardThemeId = "EMERALD" | "OCEAN" | "OBSIDIAN" | "AUTUMN";

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  gridBg: string; // Background of the board container
  cellBg: string; // Cell background
  cellHover: string;
  discBlack: string; // Shadow styling and color of P1
  discWhite: string; // Shadow styling and color of P2
  accentColor: string; // Primary colored interface parts
}
