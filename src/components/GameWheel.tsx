import { useState, useEffect, useRef } from "react";

interface GameWheelProps {
  games: string[];
  isSpinning: boolean;
  onSpinComplete: (game: string) => void;
}

export const GameWheel = ({ games, isSpinning, onSpinComplete }: GameWheelProps) => {
  const [displayedGames, setDisplayedGames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinStartTime = useRef<number>(0);

  useEffect(() => {
    if (games.length > 0) {
      setDisplayedGames([
        games[games.length - 2] || games[0],
        games[games.length - 1] || games[0],
        games[0],
        games[1] || games[0],
        games[2] || games[0],
      ]);
      setCurrentIndex(0);
    }
  }, [games]);

  useEffect(() => {
    if (isSpinning && games.length > 0) {
      spinStartTime.current = Date.now();
      let speed = 40;
      let currentIndex = Math.floor(Math.random() * games.length);
      const maxSpeed = 800;
      const spinDuration = 10000;
      const slowDownStart = 3000;
      const finalSlowDown = 3000;
      let actualFinalIndex = 0;

      const spin = () => {
        const elapsed = Date.now() - spinStartTime.current;
        
        // Update display
        setCurrentIndex(currentIndex);
        setDisplayedGames([
          games[(currentIndex - 2 + games.length) % games.length],
          games[(currentIndex - 1 + games.length) % games.length],
          games[currentIndex],
          games[(currentIndex + 1) % games.length],
          games[(currentIndex + 2) % games.length],
        ]);
        actualFinalIndex = currentIndex;

        currentIndex = (currentIndex + 1) % games.length;

        // Gradually slow down after 2 seconds
        if (elapsed > slowDownStart) {
          const slowDownProgress = Math.min((elapsed - slowDownStart) / (spinDuration - slowDownStart), 1);
          
          if (elapsed > spinDuration - finalSlowDown) {
            const finalSlowProgress = 1 - ((spinDuration - elapsed) / finalSlowDown);
            speed = Math.min(speed + 30 + (finalSlowProgress * 200), maxSpeed);
          } else {
            speed = Math.min(speed + 15 + (slowDownProgress * 50), maxSpeed);
          }
        }

        if (elapsed < spinDuration) {
          intervalRef.current = setTimeout(spin, speed);
        } else {
          setCurrentIndex(actualFinalIndex);
          setDisplayedGames([
            games[(actualFinalIndex - 2 + games.length) % games.length],
            games[(actualFinalIndex - 1 + games.length) % games.length],
            games[actualFinalIndex],
            games[(actualFinalIndex + 1) % games.length],
            games[(actualFinalIndex + 2) % games.length],
          ]);
          onSpinComplete(games[actualFinalIndex]);
        }
      };

      spin();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isSpinning, games, onSpinComplete]);

  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Select a game list to start
      </div>
    );
  }

  return (
    <div className="relative h-72">
      {/* Gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
      
      {/* Games list */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        {displayedGames.map((game, index) => (
          <div
            key={`${game}-${index}`}
            className={`text-center px-4 py-1.5 rounded-md whitespace-nowrap transition-all duration-200 ${
              index === 2
                ? "bg-primary/20 border border-primary text-foreground font-bold text-xl min-w-[200px]"
                : "text-muted-foreground/40 text-sm"
            }`}
          >
            {game}
          </div>
        ))}
      </div>
    </div>
  );
};
