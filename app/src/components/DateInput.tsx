import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";

type Props = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  className?: string;
};

export default function DateInput({
  value,
  onChange,
  min,
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

  const selectedDate = value ? parseISODate(value) : undefined;
  const minDate = min ? parseISODate(min) : undefined;

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(toISODate(date));
      setOpen(false);
    }
  }

  function handleClear(event: React.MouseEvent) {
    event.stopPropagation();
    onChange("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
      >
        <span className={value ? "text-primary-text" : "text-secondary-text"}>
          {value ? formatBR(value) : "Selecionar data"}
        </span>

        {value ? (
          <span
            role="button"
            aria-label="Limpar data"
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
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={selectedDate}
            disabled={minDate ? { before: minDate } : undefined}
          />
        </div>
      ) : null}
    </div>
  );
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
