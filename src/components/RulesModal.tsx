import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const RulesModal = () => {
  const [rules, setRules] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !rules) {
      setLoading(true);
      fetch("/RULES.md")
        .then((response) => response.text())
        .then((text) => {
          setRules(text);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading rules:", error);
          setLoading(false);
        });
    }
  }, [open, rules]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50"
        >
          <BookOpen className="w-4 h-4" />
          <span>Rules</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Game Rules</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="prose prose-sm max-w-none">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{rules}</ReactMarkdown>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};