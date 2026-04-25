import { ComponentType, SVGProps } from "react";
import Button from "./button";

type ChipProps = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  selected: boolean;
  onClick: () => void;
};

export function Chip(props: ChipProps) {
  // const { label, icon: Icon, selected, onClick } = props;

  return (
    <Button variant="ghost">Teste</Button>
    // <button onClick={onClick} aria-pressed={selected}>
    //   <Icon className="w-4 h-4" />
    //   {label}
    // </button>
  );
}
