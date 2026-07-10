import { Game } from "@/lib/sheets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface GameDetailModalProps {
  game: Game | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GameDetailModal = ({
  game,
  open,
  onOpenChange,
}: GameDetailModalProps) => {
  if (!game) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{game.name}</DialogTitle>
          <DialogDescription>Game details</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {game.categories && game.categories.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {game.categories.map((cat, idx) => (
                  <Badge key={idx} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-secondary/50 rounded-md">
              <p className="text-xs text-muted-foreground">HLTB</p>
              <p className="text-lg font-bold">{game.hours}h</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-md">
              <p className="text-xs text-muted-foreground">Author</p>
              <p className="text-sm font-medium truncate">{game.author}</p>
            </div>
          </div>

          {game.challenge && (
            <div>
              <p className="text-sm font-medium mb-2">Challenge</p>
              <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md">
                {game.challenge}
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Uploaded by: {game.uploader}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
