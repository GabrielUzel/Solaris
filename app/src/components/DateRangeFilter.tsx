import { useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";

type Props = {
  startDate?: string | null;
  endDate?: string | null;
  onChange: (range: {
    startDate: string | null;
    endDate: string | null;
  }) => void;
  className?: string;
};

export default function DateRangeFilter({
  startDate,
  endDate,
  onChange,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const selectedRange: DateRange | undefined = startDate
    ? {
        from: parseISODate(startDate),
        to: endDate ? parseISODate(endDate) : undefined,
      }
    : undefined;

  function handleSelect(range: DateRange | undefined) {
    if (!range?.from) {
      onChange({ startDate: null, endDate: null });
      return;
    }

    if (range.to) {
      onChange({
        startDate: toISODate(range.from),
        endDate: toISODate(range.to),
      });
    } else {
      onChange({
        startDate: toISODate(range.from),
        endDate: toISODate(new Date()),
      });
    }
  }

  function handleClear(event: React.MouseEvent) {
    event.stopPropagation();
    onChange({ startDate: null, endDate: null });
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
      >
        <span
          className={startDate ? "text-primary-text" : "text-secondary-text"}
        >
          {formatLabel(startDate, endDate)}
        </span>

        {startDate ? (
          <span
            role="button"
            aria-label="Limpar período"
            onClick={handleClear}
            className="ml-2 text-xs text-secondary-text hover:text-primary-text"
          >
            ✕
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 rounded-lg border border-primary-border bg-card-background p-2 shadow-2xl">
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleSelect}
            defaultMonth={selectedRange?.from}
          />
        </div>
      ) : null}
    </div>
  );
}

function formatLabel(startDate?: string | null, endDate?: string | null) {
  if (!startDate) return "Período";

  const start = formatBR(startDate);
  if (!endDate || endDate === startDate) return start;

  return `${start} - ${formatBR(endDate)}`;
}

function formatBR(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}
