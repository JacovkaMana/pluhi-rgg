import { cn } from "@/lib/utils";
import { Dices } from "lucide-react";

interface RollButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSpinning: boolean;
}

export const RollButton = ({ onClick, disabled, isSpinning }: RollButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isSpinning}
      className={cn(
        "relative px-12 py-4 rounded-xl font-bold text-xl",
        "bg-primary text-primary-foreground",
        "transition-all duration-300 transform",
        "hover:scale-105 active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        !disabled && !isSpinning && "animate-pulse-glow",
        isSpinning && "cursor-wait"
      )}
    >
      <span className="flex items-center gap-3">
        <Dices className={cn("w-6 h-6", isSpinning && "animate-spin")} />
        {isSpinning ? "Rolling..." : "Roll"}
      </span>
    </button>
  );
};
