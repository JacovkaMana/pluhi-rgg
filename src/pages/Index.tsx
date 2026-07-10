import { useState, useCallback } from "react";
import { CustomWheel, CustomWheelOption } from "@/components/CustomWheel";
import { CombinedWheel, CategoryManager } from "@/components/CombinedWheel";
import { ItemsWheel } from "@/components/ItemsWheel";
import { RollHistory, useRollHistory } from "@/components/RollHistory";
import { PlayerMapModal } from "@/components/PlayerMapModal";
import { RulesModal } from "@/components/RulesModal";
import { AllGamesList } from "@/components/AllGamesList";
import { useGameLists, GameCategoryWithGames } from "@/hooks/useGameLists";
import { useCustomWheels } from "@/hooks/useCustomWheels";
import { useItems } from "@/hooks/useItems";
import { Game } from "@/lib/sheets";
import { Sparkles, Layers, Zap, Package, List, X, User, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Item } from "@/lib/sheets";

type RouletteMode = "browse" | "combined" | "custom" | "items";

const Index = () => {
  const { lists, games, loading: listsLoading } = useGameLists();
  const { wheels, loading: wheelsLoading } = useCustomWheels();
  const { items, loading: itemsLoading, getNormalItems } = useItems();
  const { addCategoryEntry, addGameEntry, addItemsEntry } = useRollHistory();

  // Mode state
  const [mode, setMode] = useState<RouletteMode>("combined");

  // Category state - for disabling categories in combined wheel
  const [disabledCategories, setDisabledCategories] = useState<string[]>([]);

  // Combined wheel state
  const [isCombinedSpinning, setIsCombinedSpinning] = useState(false);
  const [combinedResult, setCombinedResult] = useState<{ game: string; category: GameCategoryWithGames } | null>(null);
  const [selectedGameInfo, setSelectedGameInfo] = useState<Game | null>(null);

  // Custom wheel state
  const [selectedCustomWheel, setSelectedCustomWheel] = useState<string | null>(null);
  const [isCustomSpinning, setIsCustomSpinning] = useState(false);
  const [customResult, setCustomResult] = useState<CustomWheelOption | null>(null);

  // Items wheel state
  const [isItemsSpinning, setIsItemsSpinning] = useState(false);
  const [itemsResult, setItemsResult] = useState<Item[] | null>(null);

  const handleCategoryDisable = useCallback((category: GameCategoryWithGames, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabledCategories.includes(category.id)) {
      setDisabledCategories(prev => prev.filter(id => id !== category.id));
    } else {
      setDisabledCategories(prev => [...prev, category.id]);
    }
  }, [disabledCategories]);

  const handleRollCombined = () => {
    if (lists.length === 0 || isCombinedSpinning) return;
    setIsCombinedSpinning(true);
    setCombinedResult(null);
    setResult(null);
  };

  const handleCombinedSpinComplete = useCallback((game: string, category: GameCategoryWithGames) => {
    setIsCombinedSpinning(false);
    setCombinedResult({ game, category });
    const fullGame = games.find(g => g.name === game);
    setSelectedGameInfo(fullGame || null);
    addGameEntry(category.name, category.icon, game);
  }, [games, addGameEntry]);

  const handleRollCustom = () => {
    if (!selectedCustomWheel || isCustomSpinning) return;
    setIsCustomSpinning(true);
    setCustomResult(null);
  };

  const handleCustomSpinComplete = useCallback((option: CustomWheelOption) => {
    setIsCustomSpinning(false);
    setCustomResult(option);
    // Add custom roll to history
    const wheel = wheels.find(w => w.id === selectedCustomWheel);
    if (wheel) {
      addGameEntry(wheel.name, wheel.icon, option.name);
    }
  }, [selectedCustomWheel, wheels, addGameEntry]);

  const selectedWheel = wheels.find(w => w.id === selectedCustomWheel);

  const handleRollItems = () => {
    const normalItems = getNormalItems();
    if (normalItems.length === 0 || isItemsSpinning) return;
    setIsItemsSpinning(true);
    setItemsResult(null);
  };

  const handleItemsSpinComplete = useCallback((results: Item[]) => {
    setIsItemsSpinning(false);
    setItemsResult(results);
    addItemsEntry(results.map(item => item.name));
  }, [addItemsEntry]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Плюхи RGG</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Rules Modal */}
            <RulesModal />
            
            {/* Player Map Modal */}
            <PlayerMapModal />
            
            {/* Mode Toggle - now with 4 options */}
            <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("combined")}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200",
                  mode === "combined"
                    ? "bg-purple-500/30 text-purple-200"
                    : "text-purple-300/60 hover:text-purple-300 hover:bg-purple-500/20"
                )}
              >
                <Layers className="w-4 h-4" />
                <span className="text-xs">All</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("browse")}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200",
                  mode === "browse"
                    ? "bg-blue-500/30 text-blue-200"
                    : "text-blue-300/60 hover:text-blue-300 hover:bg-blue-500/20"
                )}
              >
                <List className="w-4 h-4" />
                <span className="text-xs">Games</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("custom")}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200",
                  mode === "custom"
                    ? "bg-green-500/30 text-green-200"
                    : "text-green-300/60 hover:text-green-300 hover:bg-green-500/20"
                )}
              >
                <Zap className="w-4 h-4" />
                <span className="text-xs">Custom</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("items")}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200",
                  mode === "items"
                    ? "bg-amber-500/30 text-amber-200"
                    : "text-amber-300/60 hover:text-amber-300 hover:bg-amber-500/20"
                )}
              >
                <Package className="w-4 h-4" />
                <span className="text-xs">Items</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
        {/* Left side - Roulette area */}
        <div className="flex-1 flex flex-col gap-6">
          {mode === "combined" ? (
            <>
              {/* Combined Wheel - All games in one wheel */}
              <Card className="border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 text-center flex items-center justify-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  All Games Wheel
                </h2>
                {listsLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <CombinedWheel
                    categories={lists.filter(list => !disabledCategories.includes(list.id))}
                    games={games}
                    isSpinning={isCombinedSpinning}
                    onSpinComplete={handleCombinedSpinComplete}
                    disabledCategories={disabledCategories}
                    onCategoryDisable={handleCategoryDisable}
                  />
                )}
              </Card>

              {/* Category Manager */}
              <Card className="border border-border p-4">
                <CategoryManager
                  categories={lists}
                  disabledCategories={disabledCategories}
                  onCategoryDisable={handleCategoryDisable}
                />
              </Card>
              
              {/* Roll Button for Combined */}
              <div className="flex justify-center">
                <Button
                  onClick={handleRollCombined}
                  disabled={lists.length === 0 || isCombinedSpinning}
                  size="lg"
                  className={cn(
                    "px-16 py-6 rounded-2xl font-bold text-2xl",
                    "bg-purple-500/10 border-2 border-purple-500/30 text-purple-300",
                    "transition-all duration-300 transform",
                    "hover:bg-purple-500/20 hover:border-purple-500/50 hover:scale-105 active:scale-95",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
                    !isCombinedSpinning && lists.length > 0 && "animate-pulse-glow",
                    isCombinedSpinning && "cursor-wait"
                  )}
                >
                  {isCombinedSpinning ? "Rolling..." : "Roll All"}
                </Button>
              </div>

              {/* Combined Result Display */}
              {combinedResult && selectedGameInfo && (
                <Card className="border border-purple-500/30 bg-purple-500/10 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                        <span className="text-2xl">{combinedResult.category.icon}</span>
                        <span className="text-sm">{combinedResult.category.name}</span>
                      </div>
                      <h2 className="text-3xl font-bold text-foreground text-glow mb-2">
                        {combinedResult.game}
                      </h2>
                      {selectedGameInfo.uploader && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                          <User className="w-4 h-4" />
                          <span>{selectedGameInfo.uploader}</span>
                        </div>
                      )}
                      {selectedGameInfo.challenge && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedGameInfo.challenge}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedGameInfo(null)}
                      className="p-1 rounded hover:bg-purple-500/20 transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1 mt-3">
                    {selectedGameInfo.categories.map((cat) => (
                      <Badge key={cat} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : mode === "browse" ? (
            <>
              {/* All Games List - Browse all games */}
              <Card className="border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 text-center flex items-center justify-center gap-2">
                  <List className="w-5 h-5 text-blue-400" />
                  Browse Games
                </h2>
                {listsLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <AllGamesList games={games} />
                )}
              </Card>
            </>
          ) : mode === "items" ? (
            <>
              {/* Items Wheel - Three items rolled at once */}
              <Card className="border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 text-center flex items-center justify-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  Items Wheel
                </h2>
                {itemsLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <ItemsWheel
                    items={getNormalItems()}
                    isSpinning={isItemsSpinning}
                    onSpinComplete={handleItemsSpinComplete}
                  />
                )}
              </Card>

              {/* Items Roll Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleRollItems}
                  disabled={getNormalItems().length === 0 || isItemsSpinning}
                  size="lg"
                  className={cn(
                    "px-16 py-6 rounded-2xl font-bold text-2xl",
                    "bg-amber-500/10 border-2 border-amber-500/30 text-amber-300",
                    "transition-all duration-300 transform",
                    "hover:bg-amber-500/20 hover:border-amber-500/50 hover:scale-105 active:scale-95",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
                    !isItemsSpinning && getNormalItems().length > 0 && "animate-pulse-glow",
                    isItemsSpinning && "cursor-wait"
                  )}
                >
                  {isItemsSpinning ? "Rolling..." : "Roll Items"}
                </Button>
              </div>

              {/* Items Result Display */}
              {itemsResult && itemsResult.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {itemsResult.map((item, index) => (
                    <Card
                      key={item.id}
                      className="border border-amber-500/30 bg-amber-500/10 p-6 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
                        <Package className="w-4 h-4" />
                        <span className="text-sm font-medium">Cost: {item.cost}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-foreground text-glow mb-2">
                        {item.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {item.description || "No description"}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Custom Wheel Selector */}
              <Card className="border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
                  Select Custom Wheel
                </h2>
                {wheelsLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {wheels.map((wheel) => (
                      <button
                        key={wheel.id}
                        onClick={() => setSelectedCustomWheel(wheel.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200",
                          "border-2 bg-card hover:bg-secondary/50",
                          selectedCustomWheel === wheel.id
                            ? "border-primary bg-primary/20 scale-105 shadow-lg shadow-primary/20"
                            : "border-border opacity-60 hover:opacity-100"
                        )}
                      >
                        <span className="text-2xl">{wheel.icon}</span>
                        <span className="text-sm font-medium text-foreground">{wheel.name}</span>
                        <span className="text-xs text-muted-foreground">({wheel.options.length})</span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {/* Custom Wheel */}
              <Card className="border border-border p-6">
                {selectedWheel ? (
                  <CustomWheel
                    wheel={selectedWheel}
                    isSpinning={isCustomSpinning}
                    onSpinComplete={handleCustomSpinComplete}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Select a custom wheel to start
                  </div>
                )}
              </Card>

              {/* Custom Roll Button - styled like Roll History cards */}
              <div className="flex justify-center">
                <Button
                  onClick={handleRollCustom}
                  disabled={!selectedCustomWheel || isCustomSpinning}
                  size="lg"
                  className={cn(
                    "px-16 py-6 rounded-2xl font-bold text-2xl",
                    "bg-green-500/10 border-2 border-green-500/30 text-green-300",
                    "transition-all duration-300 transform",
                    "hover:bg-green-500/20 hover:border-green-500/50 hover:scale-105 active:scale-95",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
                    !isCustomSpinning && selectedCustomWheel && "animate-pulse-glow",
                    isCustomSpinning && "cursor-wait"
                  )}
                >
                  {isCustomSpinning ? "Rolling..." : "Roll"}
                </Button>
              </div>

              {/* Custom Result Display */}
              {customResult && (
                <Card className="border border-border p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                    <span className="text-2xl">{selectedWheel?.icon}</span>
                    <span className="text-sm">{selectedWheel?.name}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground text-glow">
                    {customResult.icon && <span className="mr-2">{customResult.icon}</span>}
                    {customResult.name}
                  </h2>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Right side - Enlarged Roll History */}
        <div className="lg:w-[450px] flex flex-col">
          <Card className="border border-border flex-1 min-h-[600px]">
            <RollHistory />
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          {mode === "combined"
            ? (combinedResult ? `${combinedResult.category.name} - ${combinedResult.game}` : "Roll the combined wheel!")
            : mode === "browse"
              ? "Browse all games"
              : mode === "items"
                ? "Roll for random items"
                : (selectedWheel?.name || "Select a custom wheel to start")
          }
        </div>
      </footer>
    </div>
  );
};

export default Index;
