import { useState, useCallback } from "react";
import { GameWheel } from "@/components/GameWheel";
import { CategoryWheel } from "@/components/CategoryWheel";
import { CustomWheel, CustomWheelOption } from "@/components/CustomWheel";
import { CombinedWheel, WheelLegend } from "@/components/CombinedWheel";
import { RollButtons } from "@/components/RollButtons";
import { ResultDisplay } from "@/components/ResultDisplay";
import { RollHistory, useRollHistory } from "@/components/RollHistory";
import { PlayerMapModal } from "@/components/PlayerMapModal";
import { GameList } from "@/components/GameList";
import { RulesModal } from "@/components/RulesModal";
import { useGameLists, GameCategoryWithGames } from "@/hooks/useGameLists";
import { useCustomWheels } from "@/hooks/useCustomWheels";
import { Sparkles, ToggleLeft, ToggleRight, Layers, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RouletteMode = "games" | "combined" | "custom";

const Index = () => {
  const { lists, loading: listsLoading } = useGameLists();
  const { wheels, loading: wheelsLoading } = useCustomWheels();
  const { addCategoryEntry, addGameEntry } = useRollHistory();
  
  // Mode state
  const [mode, setMode] = useState<RouletteMode>("games");
  
  // Category state
  const [selectedCategory, setSelectedCategory] = useState<GameCategoryWithGames | null>(null);
  const [isCategorySpinning, setIsCategorySpinning] = useState(false);
  const [disabledCategories, setDisabledCategories] = useState<string[]>([]);
  
  // Game state
  const [isGameSpinning, setIsGameSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // Combined wheel state
  const [isCombinedSpinning, setIsCombinedSpinning] = useState(false);
  const [combinedResult, setCombinedResult] = useState<{ game: string; category: GameCategoryWithGames } | null>(null);
  
  // Custom wheel state
  const [selectedCustomWheel, setSelectedCustomWheel] = useState<string | null>(null);
  const [isCustomSpinning, setIsCustomSpinning] = useState(false);
  const [customResult, setCustomResult] = useState<CustomWheelOption | null>(null);

  const handleRollCategory = () => {
    if (lists.length === 0 || isCategorySpinning || isGameSpinning) return;
    setIsCategorySpinning(true);
    setSelectedCategory(null);
    setResult(null);
  };

  const handleCategorySpinComplete = useCallback((category: GameCategoryWithGames) => {
    setIsCategorySpinning(false);
    setSelectedCategory(category);
    // Add category roll to history
    addCategoryEntry(category.name, category.icon);
  }, [addCategoryEntry]);

  const handleCategoryClick = useCallback((category: GameCategoryWithGames) => {
    // Select the category for game rolling
    setSelectedCategory(category);
  }, []);

  const handleCategoryDisable = useCallback((category: GameCategoryWithGames, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabledCategories.includes(category.id)) {
      // Re-enable category
      setDisabledCategories(prev => prev.filter(id => id !== category.id));
    } else {
      // Disable category
      setDisabledCategories(prev => [...prev, category.id]);
    }
  }, [disabledCategories]);

  const allCategoriesDisabled = lists.length > 0 && lists.every(list => disabledCategories.includes(list.id));

  const handleRollGame = () => {
    if (!selectedCategory || isGameSpinning || isCategorySpinning) return;
    setIsGameSpinning(true);
    setResult(null);
  };

  const handleGameSpinComplete = useCallback((game: string) => {
    setIsGameSpinning(false);
    setResult(game);
    
    // Add game roll to history
    if (selectedCategory) {
      addGameEntry(selectedCategory.name, selectedCategory.icon, game);
    }
  }, [selectedCategory, addGameEntry]);

  const handleRollCombined = () => {
    if (lists.length === 0 || isCombinedSpinning) return;
    setIsCombinedSpinning(true);
    setCombinedResult(null);
    setResult(null);
  };

  const handleCombinedSpinComplete = useCallback((game: string, category: GameCategoryWithGames) => {
    setIsCombinedSpinning(false);
    setCombinedResult({ game, category });
    // Add to history
    addGameEntry(category.name, category.icon, game);
  }, [addGameEntry]);

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
            
            {/* Mode Toggle - now with 3 options */}
            <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("games")}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200",
                  mode === "games"
                    ? "bg-blue-500/30 text-blue-200"
                    : "text-blue-300/60 hover:text-blue-300 hover:bg-blue-500/20"
                )}
              >
                <ToggleLeft className="w-4 h-4" />
                <span className="text-xs">Step</span>
              </Button>
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
                    isSpinning={isCombinedSpinning}
                    onSpinComplete={handleCombinedSpinComplete}
                  />
                )}
              </Card>

              {/* Legend with drop chances */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-border p-4">
                  <WheelLegend categories={lists.filter(list => !disabledCategories.includes(list.id))} />
                </Card>
                
                {/* Roll Button for Combined */}
                <div className="flex items-center justify-center">
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
              </div>

              {/* Combined Result Display */}
              {combinedResult && (
                <Card className="border border-purple-500/30 bg-purple-500/10 p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                    <span className="text-2xl">{combinedResult.category.icon}</span>
                    <span className="text-sm">{combinedResult.category.name}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground text-glow">
                    {combinedResult.game}
                  </h2>
                </Card>
              )}
            </>
          ) : mode === "games" ? (
            <>
              {/* Category Wheel */}
              <Card className="border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
                  Select Category
                </h2>
                {listsLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
              <CategoryWheel
                categories={lists.filter(list => !disabledCategories.includes(list.id))}
                isSpinning={isCategorySpinning}
                onSpinComplete={handleCategorySpinComplete}
                onCategoryClick={handleCategoryClick}
                onCategoryDisable={handleCategoryDisable}
                disabledCategories={disabledCategories}
                selectedCategoryId={selectedCategory?.id || null}
              />
                )}
              </Card>

              {/* Game Wheel */}
              <Card className="border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
                  {selectedCategory ? `${selectedCategory.name} Games` : "Select a category first"}
                </h2>
                <GameWheel
                  games={selectedCategory?.games || []}
                  isSpinning={isGameSpinning}
                  onSpinComplete={handleGameSpinComplete}
                />
              </Card>

              {/* Roll Buttons */}
              <RollButtons
                onRollCategory={handleRollCategory}
                onRollGame={handleRollGame}
                isCategorySpinning={isCategorySpinning}
                isGameSpinning={isGameSpinning}
                categorySelected={!!selectedCategory}
                disabled={lists.length === 0}
                allCategoriesDisabled={allCategoriesDisabled}
              />

              {/* Result Display */}
              <section className="min-h-24">
                <ResultDisplay
                  game={result}
                  listName={selectedCategory?.name || null}
                />
              </section>
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

          {/* Game List for Selected Category */}
          {selectedCategory && (
            <GameList 
              games={selectedCategory.games} 
              categoryName={selectedCategory.name} 
              categoryIcon={selectedCategory.icon} 
            />
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
            : mode === "games"
              ? (selectedCategory?.name || "Roll a category to start")
              : (selectedWheel?.name || "Select a custom wheel to start")
          }
        </div>
      </footer>
    </div>
  );
};

export default Index;
