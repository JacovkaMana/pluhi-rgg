import { Item } from "@/lib/sheets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ItemDetailModalProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ItemDetailModal = ({
  item,
  open,
  onOpenChange,
}: ItemDetailModalProps) => {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{item.name}</DialogTitle>
          <DialogDescription>Item details</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{item.type}</Badge>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Cost</p>
              <p className="text-lg font-bold text-primary">{item.cost}g</p>
            </div>
          </div>

          {item.description && (
            <div>
              <p className="text-sm font-medium mb-2">Description</p>
              <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md">
                {item.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
