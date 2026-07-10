import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Item } from "@/lib/sheets";

interface ItemsWheelProps {
  items: Item[];
  isSpinning: boolean;
  onSpinComplete: (results: Item[]) => void;
}

const TOTAL_SPINS = 50;

export const ItemsWheel = ({
  items,
  isSpinning,
  onSpinComplete,
}: ItemsWheelProps) => {
  const [displayedItems, setDisplayedItems] = useState<(Item | null)[][]>([]);
  const [currentItems, setCurrentItems] = useState<Item[]>([]);
  const [hasRandomized, setHasRandomized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const finalResultsRef = useRef<Item[]>([]);
  const wasSpinningRef = useRef(false);
  const spinCompleteRef = useRef(false);
  const justCompletedSpinRef = useRef(false);
  const spinItemsRef = useRef<Item[]>([]);
  const spinFinalIndicesRef = useRef<number[]>([]);

  const seededRandom = (): number => {
    const now = Date.now();
    const randomPart = Math.random();
    const seed = (now * randomPart) % 1;
    return seed;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const getDisplayWindowForIndex = (idx: number, itemList: Item[]): (Item | null)[] => {
    const total = itemList.length;
    return [
      itemList[(idx - 2 + total) % total],
      itemList[(idx - 1 + total) % total],
      itemList[idx],
      itemList[(idx + 1) % total],
      itemList[(idx + 2) % total],
    ];
  };

  useEffect(() => {
    if (justCompletedSpinRef.current) {
      justCompletedSpinRef.current = false;
      return;
    }

    if (hasRandomized && currentItems.length > 0 && !isSpinning) {
      const centerItem = displayedItems[0]?.[2];
      if (centerItem && centerItem.name) {
        return;
      }
    }

    if (items.length > 0) {
      const shuffled = shuffleArray(items);
      setCurrentItems(shuffled);
      const window = getDisplayWindowForIndex(0, shuffled);
      setDisplayedItems([window, window, window]);
      setHasRandomized(true);
    }
  }, [items]);

  useEffect(() => {
    if (isSpinning && !wasSpinningRef.current) {
      spinCompleteRef.current = false;

      if (items.length === 0) return;

      const shuffled = shuffleArray(items);
      spinItemsRef.current = shuffled;
      setCurrentItems(shuffled);

      const results: Item[] = [];
      const finalIndices: number[] = [];

      for (let i = 0; i < 3; i++) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        results.push(randomItem);
        const idx = shuffled.findIndex((item) => item.id === randomItem.id);
        finalIndices.push(idx === -1 ? 0 : idx);
      }

      finalResultsRef.current = results;
      spinFinalIndicesRef.current = finalIndices;

      const total = shuffled.length;
      const totalSteps = TOTAL_SPINS;

      const startIndices: number[] = [];
      for (let i = 0; i < 3; i++) {
        const finalIdx = finalIndices[i];
        const startIdx = ((finalIdx - totalSteps) % total + total) % total;
        startIndices.push(startIdx);
      }

      let speed = 10;
      let currentStep = 0;
      const currentIndices = [...startIndices];

      const spin = () => {
        if (currentStep >= totalSteps) {
          const finalDisplay: (Item | null)[][] = [];
          for (let wheel = 0; wheel < 3; wheel++) {
            const finalIdx = spinFinalIndicesRef.current[wheel];
            finalDisplay.push(getDisplayWindowForIndex(finalIdx, shuffled));
          }
          setDisplayedItems(finalDisplay);

          if (!spinCompleteRef.current && finalResultsRef.current.length > 0) {
            spinCompleteRef.current = true;
            justCompletedSpinRef.current = true;
            setTimeout(() => {
              onSpinComplete(finalResultsRef.current);
            }, 100);
          }
          return;
        }

        const newDisplay: (Item | null)[][] = [];
        for (let wheel = 0; wheel < 3; wheel++) {
          newDisplay.push(getDisplayWindowForIndex(currentIndices[wheel], shuffled));
          currentIndices[wheel] = (currentIndices[wheel] + 1) % total;
        }
        setDisplayedItems(newDisplay);

        currentStep++;

        const progress = currentStep / totalSteps;

        if (progress < 0.5) {
          speed = 1;
        } else if (progress < 0.7) {
          speed = 5 + ((progress - 0.5) / 0.2) * 10;
        } else if (progress < 0.85) {
          speed = 10 + ((progress - 0.7) / 0.15) * 10;
        } else if (progress < 0.92) {
          speed = 50 + ((progress - 0.85) / 0.07) * 50;
        } else if (progress < 0.96) {
          speed = 100 + ((progress - 0.92) / 0.04) * 100;
        } else if (progress < 0.98) {
          speed = 200 + ((progress - 0.96) / 0.02) * 150;
        } else {
          speed = 1200 + ((progress - 0.998) / 0.02) * 900;
        }

        intervalRef.current = setTimeout(spin, speed);
      };

      spin();
    }

    wasSpinningRef.current = isSpinning;

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isSpinning, items, onSpinComplete]);

  if (items.length === 0 || currentItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No items available
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-8">
      {[0, 1, 2].map((wheelIndex) => (
        <div key={wheelIndex} className="relative w-56">
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />

          <div className="flex flex-col items-center justify-center gap-1 py-4">
            {displayedItems[wheelIndex]?.map((item, index) => (
              <div
                key={`${wheelIndex}-${index}-${item?.id || 'empty'}`}
                className={cn(
                  "text-center px-3 py-1.5 rounded-md whitespace-nowrap transition-all duration-200 w-full",
                  index === 2
                    ? "bg-amber-500/20 border-2 border-amber-500 text-foreground font-bold text-xl min-w-[200px] shadow-lg shadow-amber-500/20"
                    : "text-muted-foreground/40 text-sm"
                )}
              >
                {item ? item.name : "—"}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};