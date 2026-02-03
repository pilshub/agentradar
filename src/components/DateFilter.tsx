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
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Filtrar:
        </span>
        <div className="flex flex-wrap gap-2">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => onRangeChange(range.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                selectedRange === range.value
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {selectedRange === "custom" && onCustomDateChange && (
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={customStart || ""}
              onChange={(e) =>
                onCustomDateChange(e.target.value, customEnd || "")
              }
              className="px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500"
            />
            <span className="text-gray-500">→</span>
            <input
              type="date"
              value={customEnd || ""}
              onChange={(e) =>
                onCustomDateChange(customStart || "", e.target.value)
              }
              className="px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
