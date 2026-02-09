import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapIcon } from "lucide-react";
import { PlayerMap } from "@/components/PlayerMap";
import { cn } from "@/lib/utils";

export const PlayerMapModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
          "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300",
          "hover:bg-cyan-500/20 hover:border-cyan-500/50"
        )}>
          <MapIcon className="w-4 h-4" />
          <span>View Map</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Player Map</DialogTitle>
        </DialogHeader>
        <PlayerMap />
      </DialogContent>
    </Dialog>
  );
};