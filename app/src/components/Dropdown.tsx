import { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

export default function Dropdown({
  value,
  options,
  onChange,
  className = "",
  placeholder = "Selecione",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

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

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
      >
        <span
          className={selected ? "text-primary-text" : "text-secondary-text"}
        >
          {selected?.label ?? placeholder}
        </span>

        <svg
          className={`h-4 w-4 text-secondary-text transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-primary-border bg-card-background shadow-2xl"
        >
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(option.value)}
                className={[
                  "flex w-full items-center px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-hover-background font-medium text-primary-text"
                    : "text-primary-text hover:bg-hover-background hover:text-primary-text",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
