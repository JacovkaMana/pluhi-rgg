import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, ExternalLink } from "lucide-react";

interface ResultDisplayProps {
  game: string | null;
  listName: string | null;
}

export const ResultDisplay = ({ game, listName }: ResultDisplayProps) => {
  const searchUrl = game 
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(game + " longplay")}`
    : null;

  const hltbUrl = game 
    ? `https://howlongtobeat.com/?q=${encodeURIComponent(game)}`
    : null;

  return (
    <AnimatePresence mode="wait">
      {game && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Gamepad2 className="w-5 h-5" />
            <span className="text-sm">{listName}</span>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground text-glow">
            {game}
          </h2>

          <a
            href={searchUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
          ><ExternalLink className="w-4 h-4" />
            Watch gameplay on YouTube
          </a>
          <a
            href={hltbUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
          ><ExternalLink className="w-4 h-4" />
                     How long to beat
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
