import { BoardTheme } from "../types";

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: "EMERALD",
    name: "Classic Emerald",
    gridBg: "bg-emerald-950/70 border-emerald-800",
    cellBg: "bg-emerald-700/80 hover:bg-emerald-600/90",
    cellHover: "bg-emerald-600/50",
    discBlack: "bg-radial from-neutral-700 via-neutral-900 to-black shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.2)]",
    discWhite: "bg-radial from-white via-neutral-100 to-neutral-300 shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_2px_4px_white]",
    accentColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "OCEAN",
    name: "Cyber Ocean",
    gridBg: "bg-slate-900/90 border-blue-900",
    cellBg: "bg-blue-950/60 hover:bg-blue-900/50",
    cellHover: "bg-blue-800/40",
    discBlack: "bg-radial from-slate-800 to-slate-950 shadow-[0_0_15px_rgba(59,130,246,0.3),0_4px_8px_rgba(0,0,0,0.6)]",
    discWhite: "bg-radial from-cyan-400 via-cyan-100 to-white shadow-[0_0_15px_rgba(34,211,238,0.5),0_4px_8px_rgba(0,0,0,0.2)]",
    accentColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    id: "OBSIDIAN",
    name: "Midnight Obsidian",
    gridBg: "bg-neutral-950 border-neutral-800",
    cellBg: "bg-neutral-900 hover:bg-neutral-800",
    cellHover: "bg-neutral-700/30",
    discBlack: "bg-radial from-neutral-800 via-neutral-900 to-black shadow-[0_2px_8px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)]",
    discWhite: "bg-radial from-zinc-200 via-zinc-100 to-white shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_2px_white]",
    accentColor: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  },
  {
    id: "AUTUMN",
    name: "Amber Autumn",
    gridBg: "bg-[#451a03]/80 border-amber-900/40",
    cellBg: "bg-amber-100/10 hover:bg-amber-100/20",
    cellHover: "bg-amber-500/20",
    discBlack: "bg-radial from-stone-800 to-[#1c1917] shadow-[0_4px_10px_rgba(0,0,0,0.5)]",
    discWhite: "bg-radial from-[#fffbeb] to-amber-100 shadow-[0_4px_10px_rgba(0,0,0,0.2)]",
    accentColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  }
];
