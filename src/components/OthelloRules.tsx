import React from "react";
import { X, HelpCircle, CornerDownRight, Landmark, Info } from "lucide-react";

interface OthelloRulesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OthelloRules: React.FC<OthelloRulesProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-neutral-950/40">
          <div className="flex items-center gap-2 text-indigo-400">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-md font-bold uppercase tracking-wider text-white">オセロのルール & 遊び方</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Modal close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-zinc-300 leading-relaxed custom-scrollbar">
          
          <section className="space-y-2">
            <h3 className="flex items-center gap-1.5 font-bold text-white text-md border-b border-zinc-800 pb-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              1. 基本的な目的
            </h3>
            <p>
              盤面のマス(8x8)の上に自分の色のディスクを交互に置き、最終的に<strong>盤面のディスクの数が多いプレイヤー</strong>が勝ちとなります。黒が先手、白が後手です。
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-1.5 font-bold text-white text-md border-b border-zinc-800 pb-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              2. ディスクを置くためのルール
            </h3>
            <p>
              プレイヤーは、既に置かれている相手のディスクを、自分のディスクで<strong>縦・横・斜めのいずれかの方向で挟める位置</strong>にのみディスクを置くことができます。
            </p>
            <p className="bg-yellow-500/10 border border-yellow-600/20 text-yellow-500 p-2.5 rounded-lg text-xs flex gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>挟むことで、間にある相手のディスクがすべて自分の色にひっくり返ります。挟める場所がないマスには置くことができません。</span>
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-1.5 font-bold text-white text-md border-b border-zinc-800 pb-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              3. 「パス」の発生
            </h3>
            <p>
              自分の手番で<strong>挟めるディスク（置ける場所）が1つもない場合</strong>は、手番が自動でスキップ（「パス」）され、相手の手番になります。
            </p>
            <p>
              お互いに置く場所がなくなる（全てのマスが埋まるか、両者とも挟む手段が消える）とゲームが終了します。
            </p>
          </section>

          <section className="space-y-2.5">
            <h3 className="flex items-center gap-1.5 font-bold text-white text-md border-b border-zinc-800 pb-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              🏆 戦略のコツ（四隅の重要性）
            </h3>
            <div className="grid grid-cols-1 gap-2 bg-[#27272a]/30 p-3 rounded-xl border border-zinc-800">
              <div className="flex gap-2 items-start text-xs">
                <Landmark className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">角（A1, A8, H1, H8）は最優先！</strong>
                  <p className="text-zinc-400 mt-0.5">
                    角に置かれたディスクは構造上絶対に相手から挟まれることがありません（確定石）。角を奪取することが勝利への最大の近道です。
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-start text-xs mt-1.5">
                <CornerDownRight className="w-4 h-4 text-red-550 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">角の周り（C-square & X-square）に注意</strong>
                  <p className="text-zinc-400 mt-0.5">
                    角に隣接するマスに安易に配置すると、相手に角に入り込む隙を与えてしまいます。相手をいかに誘導するかがポイントです。
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-neutral-950/20 text-center flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all"
          >
            ルールを理解した
          </button>
        </div>
      </div>
    </div>
  );
};
