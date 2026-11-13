import { getBank } from "../../utils/banks";

type Props = {
  name: string;
  bank: string;
  closingDay?: number;
  dueDay?: number;
  className?: string;
};

export default function CreditCardVisual({
  name,
  bank,
  closingDay,
  dueDay,
  className = "",
}: Props) {
  const bankInfo = getBank(bank);
  const { Logo } = bankInfo;
  const hasDays = closingDay != null && dueDay != null;

  return (
    <div
      className={[
        "flex flex-col gap-4 rounded-2xl p-4 text-white",
        className,
      ].join(" ")}
      style={{
        backgroundImage: `linear-gradient(135deg, ${bankInfo.primaryColor}, ${bankInfo.primaryColor}CC)`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="pt-1 text-[10px] uppercase tracking-wide opacity-80">
          Cartão de crédito
        </span>

        <div
          className={[
            "flex shrink-0 items-center justify-center",
            bankInfo.logoWrapperClassName,
          ].join(" ")}
        >
          <Logo
            className={bankInfo.logoClassName}
            style={
              bankInfo.logoColor ? { color: bankInfo.logoColor } : undefined
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="truncate font-semibold">{name}</span>
        <span className="text-xs opacity-80">{bankInfo.name}</span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <span className="font-mono text-sm opacity-70">
          •••• •••• •••• ••••
        </span>

        {hasDays && (
          <span className="text-right text-xs opacity-80">
            Fecha dia {closingDay} · Vence dia {dueDay}
          </span>
        )}
      </div>
    </div>
  );
}
