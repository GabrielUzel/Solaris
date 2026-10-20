import CurrencyInput from "react-currency-input-field";

type Props = {
  value: number;
  onChange: (cents: number) => void;
  placeholder?: string;
  className?: string;
};

export default function MoneyInput({
  value,
  onChange,
  placeholder = "0,00",
  className = "",
}: Props) {
  return (
    <CurrencyInput
      value={(value / 100).toFixed(2)}
      placeholder={placeholder}
      decimalSeparator=","
      groupSeparator="."
      disableAbbreviations
      decimalsLimit={2}
      fixedDecimalLength={2}
      transformRawValue={(rawValue) => {
        const digits = (rawValue ?? "").replace(/\D/g, "");
        const cents = digits ? parseInt(digits, 10) : 0;

        const integerPart = Math.floor(cents / 100);
        const decimalPart = String(cents % 100).padStart(2, "0");

        return `${integerPart},${decimalPart}`;
      }}
      onValueChange={(_value, _name, values) => {
        const cents = Math.round((values?.float ?? 0) * 100);
        onChange(cents);
      }}
      className={[
        "rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none",
        className,
      ].join(" ")}
    />
  );
}
