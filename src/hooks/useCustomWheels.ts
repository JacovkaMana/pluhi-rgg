import { useState, useEffect, useCallback } from "react";
import { supabase, CustomWheel as SupabaseWheel, WheelOption } from "@/lib/supabase";
import { CustomWheel as ComponentWheel } from "@/components/CustomWheel";

// Default custom wheels (fallback when Supabase is not available)
const defaultWheels: ComponentWheel[] = [
  {
    id: "good_event",
    name: "Хороший ивент",
    icon: "🌝",
    options: [
      { id: "c1", name: "Пиздец потел", icon: "😓" },
      { id: "c2", name: "Запрета депа", icon: "🎡" },
      { id: "c3", name: "Отдых", icon: "🧘" },
      { id: "c4", name: "Друзьяшки", icon: "👯" },
      { id: "c5", name: "Подсос", icon: "🧛" },
      { id: "c6", name: "Реролл", icon: "🎲" },
      { id: "c7", name: "День сурка", icon: "🔄" },
      { id: "c8", name: "Вдохновение", icon: "💡" },
      { id: "c9", name: "Добро ПАЗИТИВ", icon: "😇" },
      { id: "c10", name: "Левая палочка Твикс", icon: "🍫" },
      { id: "c11", name: "Правая палочка Твикс", icon: "🍫" },
      { id: "c12", name: "Помощь другу", icon: "🤝" },
      { id: "c13", name: "Свинья копилка", icon: "🐷" },
      { id: "c14", name: "Обманка", icon: "🃏" },
      { id: "c15", name: "Рыцарский турнир", icon: "⚔️" },
      { id: "c16", name: "ЭТО МНЕ ?", icon: "❓" },
      { id: "c17", name: "Марафон", icon: "🏃" },
      { id: "c18", name: "Нету тела - Нету дела", icon: "👻" },
      { id: "c19", name: "Бабл", icon: "🫧" },
      { id: "c20", name: "Тараканьи бега", icon: "🪳" },
      { id: "c21", name: "НАС РАТЬ", icon: "🛡️" },
      { id: "c22", name: "НАС РАНО", icon: "😈" },
      { id: "c23", name: "Гурман", icon: "🍽️" },
      { id: "c24", name: "Ложка меда в бочке меда", icon: "🍯" },
    ],
  },
  {
    id: "bad_event",
    name: "Плохой ивент",
    icon: "🌚",
    options: [
      { id: "c25", name: "Ш- значит общительная", icon: "🗣️" },
      { id: "c26", name: "Даже не вспотел", icon: "😎" },
      { id: "c27", name: "Твое Имя", icon: "📛" },
      { id: "c28", name: "Жакерке", icon: "🃏" },
      { id: "c29", name: "Равенство их голосов", icon: "⚖️" },
      { id: "c30", name: "ЭТО ЖЕ ДОЛЛАР", icon: "💵" },
      { id: "c31", name: "Мама дома", icon: "🏠" },
      { id: "c32", name: "куда гонишь брад", icon: "🏎️" },
      { id: "c33", name: "Сущие копейки", icon: "🪙" },
      { id: "c34", name: "Битва была равна", icon: "🎲" },
      { id: "c35", name: "Гаси компутер", icon: "🔌" },
      { id: "c36", name: "Пиявка", icon: "🪱" },
      { id: "c37", name: "ДООР СТАК", icon: "🚪" },
      { id: "c38", name: "Обманка", icon: "🎭" },
      { id: "c39", name: "Специальная Итальянская Операция", icon: "🇮🇹" },
      { id: "c40", name: "И он пропал", icon: "🤡" },
      { id: "c41", name: "Значек", icon: "🏅" },
      { id: "c42", name: "Шеф поВОР", icon: "👨‍🍳" },
      { id: "c43", name: "Проклятие Ваномаса", icon: "📺" },
      { id: "c44", name: "dopamine maxxing", icon: "🤪" },
      { id: "c45", name: "Свинья копилка", icon: "💰" },
      { id: "c46", name: "Дуэль на эсефах", icon: "🔫" },
      { id: "c47", name: "ТЫ ГОВОРИЛ ЧТО ШАРИШ", icon: "🤨" },
      { id: "c48", name: "В это мы ИГРАЕМ", icon: "💣" },
    ],
  },
  {
    id: "spec_wheel",
    name: "Кубик",
    icon: "🏆",
    options: [
      { id: "r1", name: "1", icon: "⚀" },
      { id: "r2", name: "2", icon: "⚁" },
      { id: "r3", name: "3", icon: "⚂" },
      { id: "r4", name: "4", icon: "⚃" },
      { id: "r5", name: "5", icon: "⚄" },
    ],
  },
  {
    id: "coinflip",
    name: "Монетка",
    icon: "🪙",
    options: [
      { id: "g2", name: "Хорошо", icon: "⚀" },
      { id: "b5", name: "ПЛоха", icon: "⚁" },
    ],
  },
  {
    id: "fate_wheel",
    name: "СпецКолесо",
    icon: "👨‍👦‍👦",
    options: [
      { id: "r1", name: "Jacovka", icon: "❤️" },
      { id: "r2", name: "Serega", icon: "⚡" },
      { id: "r3", name: "VinilVas", icon: "🌟" },
      { id: "r4", name: "nikunka", icon: "⏭️" },
      { id: "r5", name: "Beezar", icon: "🎁" },
      { id: "r6", name: "Drummer", icon: "🎁" },
      { id: "r7", name: "nik_flatcher", icon: "⏭️" },
      { id: "r8", name: "Reiji", icon: "🌟" },
      { id: "r9", name: "Abaddon", icon: "⚡" },
      { id: "r10", name: "UMARR", icon: "🎁" },
    ],
  },
  {
    id: "coop",
    name: "COOP",
    icon: "🤝",
    options: [
      { id: "c49", name: "BattleBlock", icon: "🎭" },
      { id: "c50", name: "It Takes Two", icon: "💑" },
      { id: "c51", name: "Bread and Fred", icon: "🐧" },
      { id: "c52", name: "A way out", icon: "⛓️" },
      { id: "c53", name: "We were here together", icon: "🤝" },
      { id: "c54", name: "We were here forever", icon: "🧊" },
      { id: "c55", name: "We were here expeditions", icon: "⛺" },
      { id: "c56", name: "Cuphead", icon: "☕" },
      { id: "c57", name: "Aragami", icon: "🥷" },
      { id: "c58", name: "Escape Simulator", icon: "🗝️" },
      { id: "c59", name: "Super Bunny Man", icon: "🐰" },
      { id: "c60", name: "Borderlands 2", icon: "🔫" },
      { id: "c61", name: "Grim Dawn", icon: "💀" },
      { id: "c62", name: "We were here", icon: "🗣️" },
      { id: "c63", name: "Sea of Stars", icon: "⭐" },
      { id: "c64", name: "Magicka", icon: "🔮" },
    ],
  },
];

export const useCustomWheels = () => {
  const [wheels, setWheels] = useState<ComponentWheel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWheels = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch wheels from Supabase
      const { data: wheelData, error: wheelError } = await supabase
        .from("custom_wheels")
        .select("*")
        .order("name");

      if (wheelError) throw wheelError;

      if (!wheelData || wheelData.length === 0) {
        // Use default wheels if no data in Supabase
        setWheels(defaultWheels);
        return;
      }

      // Fetch options for each wheel
      const wheelsWithOptions: ComponentWheel[] = await Promise.all(
        wheelData.map(async (wheel) => {
          const { data: optionsData } = await supabase
            .from("wheel_options")
            .select("*")
            .eq("wheel_id", wheel.id)
            .order("display_order");

          return {
            id: wheel.id,
            name: wheel.name,
            icon: wheel.icon,
            options: (optionsData || []).map((opt: WheelOption) => ({
              id: opt.id,
              name: opt.name,
              icon: opt.icon,
            })),
          };
        })
      );

      setWheels(wheelsWithOptions);
    } catch (error) {
      console.error("Failed to load custom wheels from Supabase:", error);
      // Fallback to default wheels on error
      setWheels(defaultWheels);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWheels();
  }, [fetchWheels]);

  const saveWheels = async (newWheels: ComponentWheel[]) => {
    try {
      // Delete all existing wheels and options
      const { data: existingWheels } = await supabase
        .from("custom_wheels")
        .select("id");

      if (existingWheels && existingWheels.length > 0) {
        await supabase
          .from("custom_wheels")
          .delete()
          .in("id", existingWheels.map((w) => w.id));
      }

      // Insert new wheels and options
      for (const wheel of newWheels) {
        await supabase.from("custom_wheels").insert({
          id: wheel.id,
          name: wheel.name,
          icon: wheel.icon,
          updated_at: new Date().toISOString(),
        });

        for (let i = 0; i < wheel.options.length; i++) {
          const option = wheel.options[i];
          await supabase.from("wheel_options").insert({
            id: option.id,
            wheel_id: wheel.id,
            name: option.name,
            icon: option.icon || "",
            display_order: i,
          });
        }
      }

      setWheels(newWheels);
    } catch (error) {
      console.error("Failed to save custom wheels:", error);
    }
  };

  const addWheel = async (wheel: ComponentWheel) => {
    const newWheels = [...wheels, wheel];
    await saveWheels(newWheels);
  };

  const updateWheel = async (id: string, updatedWheel: Partial<ComponentWheel>) => {
    const newWheels = wheels.map((w) =>
      w.id === id ? { ...w, ...updatedWheel } : w
    );
    await saveWheels(newWheels);
  };

  const deleteWheel = async (id: string) => {
    const newWheels = wheels.filter((w) => w.id !== id);
    await saveWheels(newWheels);
  };

  const resetToDefaults = async () => {
    await saveWheels(defaultWheels);
  };

  return {
    wheels,
    loading,
    addWheel,
    updateWheel,
    deleteWheel,
    resetToDefaults,
    refetch: fetchWheels,
  };
};
