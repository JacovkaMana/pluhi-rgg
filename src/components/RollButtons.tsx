import { cn } from "@/lib/utils";
import { Dices, Layers } from "lucide-react";

interface RollButtonsProps {
  onRollCategory: () => void;
  onRollGame: () => void;
  isCategorySpinning: boolean;
  isGameSpinning: boolean;
  categorySelected: boolean;
  disabled?: boolean;
  allCategoriesDisabled?: boolean;
}

export const RollButtons = ({
  onRollCategory,
  onRollGame,
  isCategorySpinning,
  isGameSpinning,
  categorySelected,
  disabled = false,
  allCategoriesDisabled = false,
}: RollButtonsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      {/* Category Roll Button - styled like Roll History cards */}
      <button
        onClick={onRollCategory}
        disabled={disabled || isCategorySpinning || isGameSpinning || allCategoriesDisabled}
        className={cn(
          "relative px-8 py-3 rounded-xl font-bold text-lg",
          "bg-purple-500/10 border border-purple-500/30 text-purple-300",
          "transition-all duration-300 transform",
          "hover:bg-purple-500/20 hover:border-purple-500/50 hover:scale-105 active:scale-95",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-purple-500/10",
          !disabled && !isCategorySpinning && !isGameSpinning && !allCategoriesDisabled && "animate-pulse-glow",
          (isCategorySpinning || isGameSpinning || allCategoriesDisabled) && "cursor-wait"
        )}
      >
        <span className="flex items-center gap-2">
          <Layers className={cn("w-5 h-5", isCategorySpinning && "animate-spin")} />
          {isCategorySpinning ? "Rolling..." : "Roll Category"}
        </span>
      </button>

      {/* Game Roll Button - styled like Roll History cards */}
      <button
        onClick={onRollGame}
        disabled={disabled || !categorySelected || isGameSpinning || isCategorySpinning}
        className={cn(
          "relative px-8 py-3 rounded-xl font-bold text-lg",
          "bg-blue-500/10 border border-blue-500/30 text-blue-300",
          "transition-all duration-300 transform",
          "hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 active:scale-95",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-blue-500/10",
          !disabled && categorySelected && !isGameSpinning && !isCategorySpinning && "animate-pulse-glow",
          (isGameSpinning || isCategorySpinning) && "cursor-wait"
        )}
      >
        <span className="flex items-center gap-2">
          <Dices className={cn("w-5 h-5", isGameSpinning && "animate-spin")} />
          {isGameSpinning ? "Rolling..." : "Roll Game"}
        </span>
      </button>
    </div>
  );
};