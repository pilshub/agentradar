"use client";

export type DateRange = "today" | "week" | "month" | "all" | "custom";

interface DateFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  customStart?: string;
  customEnd?: string;
  onCustomDateChange?: (start: string, end: string) => void;
}

export function DateFilter({
  selectedRange,
  onRangeChange,
  customStart,
  customEnd,
  onCustomDateChange,
}: DateFilterProps) {
  const ranges: { value: DateRange; label: string }[] = [
    { value: "today", label: "Hoy" },
    { value: "week", label: "7 días" },
    { value: "month", label: "30 días" },
    { value: "all", label: "Todas" },
    { value: "custom", label: "Personalizado" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
          Filtrar por fecha:
        </span>
        <div className="flex flex-wrap gap-2">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => onRangeChange(range.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedRange === range.value
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {selectedRange === "custom" && onCustomDateChange && (
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Desde:
            </label>
            <input
              type="date"
              value={customStart || ""}
              onChange={(e) =>
                onCustomDateChange(e.target.value, customEnd || "")
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Hasta:
            </label>
            <input
              type="date"
              value={customEnd || ""}
              onChange={(e) =>
                onCustomDateChange(customStart || "", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
