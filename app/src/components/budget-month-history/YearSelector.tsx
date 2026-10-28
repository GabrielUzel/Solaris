import Dropdown from "../Dropdown";

type Props = {
  years: number[];
  selectedYear: number | null;
  onChange: (year: number) => void;
};

export default function YearSelector({
  years,
  selectedYear,
  onChange,
}: Props) {
  const options = [...years]
    .sort((a, b) => b - a)
    .map((year) => ({ label: String(year), value: String(year) }));

  return (
    <Dropdown
      label="Ano"
      placeholder="Selecione"
      className="w-36"
      value={selectedYear != null ? String(selectedYear) : ""}
      onChange={(value) => onChange(Number(value))}
      options={options}
    />
  );
}
