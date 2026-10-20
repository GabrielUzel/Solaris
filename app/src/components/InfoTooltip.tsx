type Props = {
  text: string;
};

export default function InfoTooltip({ text }: Props) {
  return (
    <span className="group relative inline-flex shrink-0">
      <span
        aria-hidden="true"
        className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-secondary-text/40 text-[10px] font-medium leading-none text-secondary-text transition-colors group-hover:border-primary group-hover:text-primary"
      >
        ?
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-52 -translate-x-1/2 translate-y-1 rounded-lg border border-primary-border bg-card-background px-3 py-2 text-xs font-normal text-primary-text opacity-0 shadow-xl transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
