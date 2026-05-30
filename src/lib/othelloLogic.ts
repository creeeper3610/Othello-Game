import { Board, Player, Cell, Difficulty } from "../types";

// Constant directional vectors for 8 directions on the 8x8 grid
export const DIRECTIONS = [
  [-1, -1], [-1,  0], [-1,  1],
  [ 0, -1],           [ 0,  1],
  [ 1, -1], [ 1,  0], [ 1,  1]
];

// Othello positional weight matrix for the HARD minimax AI.
// Corners are highly valuable (120), edges are generally good (20/15),
// cells adjacent to corners are dangerous (-40, -20) until the corner is owned.
const POSITIONAL_WEIGHTS = [
  [120, -20,  20,   5,   5,  20, -20, 120],
  [-20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [ 20,  -5,  15,   3,   3,  15,  -5,  20],
  [  5,  -5,   3,   3,   3,   3,  -5,   5],
  [  5,  -5,   3,   3,   3,   3,  -5,   5],
  [ 20,  -5,  15,   3,   3,  15,  -5,  20],
  [-20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [120, -20,  20,   5,   5,  20, -20, 120]
];

// Initialize an 8x8 board with the standard 4 center discs
export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Customary starting configuration
  board[3][3] = "WHITE";
  board[3][4] = "BLACK";
  board[4][3] = "BLACK";
  board[4][4] = "WHITE";
  
  return board;
}

// Check if row and column are inside board boundaries
export function isWithinBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

/**
 * Returns a list of coordinates that will be flipped in a specific direction 
 * if a move is placed at (row, col) by player.
 * If the move is invalid in that direction, returns an empty array.
 */
export function getFlipsInDirection(
  board: Board,
  row: number,
  col: number,
  player: Player,
  dr: number,
  dc: number
): [number, number][] {
  const opponent: Player = player === "BLACK" ? "WHITE" : "BLACK";
  const flips: [number, number][] = [];
  
  let r = row + dr;
  let c = col + dc;
  
  // Traverse in direction as long as we find opponent pieces
  while (isWithinBounds(r, c) && board[r][c] === opponent) {
    flips.push([r, c]);
    r += dr;
    c += dc;
  }
  
  // If the sequence ends with a piece of the current player, the flip is valid
  if (isWithinBounds(r, c) && board[r][c] === player && flips.length > 0) {
    return flips;
  }
  
  return [];
}

/**
 * Returns all coordinates flipped by placing a disc at (row, col) by player.
 * If placing here is illegal (no pieces flipped), returns empty array.
 */
export function getFlippedDiscs(
  board: Board,
  row: number,
  col: number,
  player: Player
): [number, number][] {
  // If cell is already occupied, it's an invalid move
  if (board[row][col] !== null) {
    return [];
  }
  
  const flipped: [number, number][] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const dirFlips = getFlipsInDirection(board, row, col, player, dr, dc);
    flipped.push(...dirFlips);
  }
  
  return flipped;
}

// Check if a move at (row, col) is valid for player
export function isValidMove(board: Board, row: number, col: number, player: Player): boolean {
  if (board[row][col] !== null) return false;
  
  for (const [dr, dc] of DIRECTIONS) {
    const flips = getFlipsInDirection(board, row, col, player, dr, dc);
    if (flips.length > 0) return true;
  }
  
  return false;
}

// Get all valid moves on the board for a player
export function getValidMoves(board: Board, player: Player): [number, number][] {
  const validMoves: [number, number][] = [];
  
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (isValidMove(board, r, c, player)) {
        validMoves.push([r, c]);
      }
    }
  }
  
  return validMoves;
}

// Places a disc on the board and flips opposite discs. Returns the updated board.
export function makeMove(board: Board, row: number, col: number, player: Player): Board {
  const flips = getFlippedDiscs(board, row, col, player);
  if (flips.length === 0 && !isValidMove(board, row, col, player)) {
    // If the move somehow isn't valid, return original board
    return board;
  }
  
  // Clone board deep
  const nextBoard = board.map(rowArr => [...rowArr]);
  
  // Place current player's piece
  nextBoard[row][col] = player;
  
  // Flip all legal captures
  for (const [fr, fc] of flips) {
    nextBoard[fr][fc] = player;
  }
  
  return nextBoard;
}

// Get count of discs on the board for each player
export function getScores(board: Board): { BLACK: number; WHITE: number } {
  let black = 0;
  let white = 0;
  
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === "BLACK") black++;
      else if (board[r][c] === "WHITE") white++;
    }
  }
  
  return { BLACK: black, WHITE: white };
}

// Position evaluation score helpful for AI heuristic calculation
function evaluateBoardScore(board: Board, player: Player): number {
  const opponent: Player = player === "BLACK" ? "WHITE" : "BLACK";
  let score = 0;
  
  // Weight addition
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === player) {
        score += POSITIONAL_WEIGHTS[r][c];
      } else if (board[r][c] === opponent) {
        score -= POSITIONAL_WEIGHTS[r][c];
      }
    }
  }
  
  return score;
}

/**
 * Minimax algorithm with Alpha-Beta pruning to find optimal moves for Computer
 */
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: Player
): { score: number; move: [number, number] | null } {
  const opponent: Player = aiPlayer === "BLACK" ? "WHITE" : "BLACK";
  const activePlayer = isMaximizing ? aiPlayer : opponent;
  const validMoves = getValidMoves(board, activePlayer);
  
  // Base cases: depth limit reached or no moves possible
  if (depth === 0 || validMoves.length === 0) {
    return { score: evaluateBoardScore(board, aiPlayer), move: null };
  }
  
  let bestMove: [number, number] | null = null;
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const [r, c] of validMoves) {
      const nextBoard = makeMove(board, r, c, aiPlayer);
      const evaluation = minimax(nextBoard, depth - 1, alpha, beta, false, aiPlayer).score;
      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = [r, c];
      }
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cut-off
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const [r, c] of validMoves) {
      const nextBoard = makeMove(board, r, c, opponent);
      const evaluation = minimax(nextBoard, depth - 1, alpha, beta, true, aiPlayer).score;
      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = [r, c];
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return { score: minEval, move: bestMove };
  }
}

/**
 * CPU Opponent calculation based on difficulty level.
 * Returns coord [row, col] or null if no valid moves exist.
 */
export function getCPUMove(
  board: Board,
  cpuPlayer: Player,
  difficulty: Difficulty
): [number, number] | null {
  const validMoves = getValidMoves(board, cpuPlayer);
  if (validMoves.length === 0) return null;
  
  if (difficulty === "EASY") {
    // Pick absolutely random move
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }
  
  if (difficulty === "MEDIUM") {
    // Greedy heuristic: Pick the move that flips the maximum number of pieces immediately
    // Add small points for edge/corners to make it slightly smarter but not dominant
    let bestMove = validMoves[0];
    let maxFlipped = -1;
    
    for (const [r, c] of validMoves) {
      const flips = getFlippedDiscs(board, r, c, cpuPlayer).length;
      let score = flips;
      
      // Bonus evaluation
      if ((r === 0 || r === 7) && (c === 0 || c === 7)) score += 15; // Corner bonus
      else if (r === 0 || r === 7 || c === 0 || c === 7) score += 4; // Edge bonus
      
      if (score > maxFlipped) {
        maxFlipped = score;
        bestMove = [r, c];
      }
    }
    return bestMove;
  }
  
  // HARD mode uses minimax search with depth 3 and alpha-beta pruning.
  // It plans ahead and understands corner captures, adjacency, and stable disks.
  const result = minimax(board, 3, -Infinity, Infinity, true, cpuPlayer);
  return result.move || validMoves[0]; // Fallback to first if somehow no move returned
}
