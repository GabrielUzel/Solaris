import type { ComponentType, SVGProps } from "react";

import CardIcon from "../assets/icons/card.svg?react";
import BancoDoBrasilLogo from "../assets/banks/banco-do-brasil.svg?react";
import BradescoLogo from "../assets/banks/bradesco.svg?react";
import CaixaLogo from "../assets/banks/caixa.svg?react";
import InterLogo from "../assets/banks/inter.svg?react";
import ItauLogo from "../assets/banks/itau.svg?react";
import NubankLogo from "../assets/banks/nubank.svg?react";
import SantanderLogo from "../assets/banks/santander.svg?react";

export type BankInfo = {
  id: string;
  name: string;
  Logo: ComponentType<SVGProps<SVGSVGElement>>;
  primaryColor: string;
  logoWrapperClassName: string;
  logoClassName: string;
  logoColor?: string;
};

export const BANKS: BankInfo[] = [
  {
    id: "nubank",
    name: "Nubank",
    Logo: NubankLogo,
    primaryColor: "#820AD1",
    logoWrapperClassName: "h-9 w-9",
    logoClassName: "h-8 w-8",
  },
  {
    id: "inter",
    name: "Banco Inter",
    Logo: InterLogo,
    primaryColor: "#FF7A00",
    logoWrapperClassName: "h-9 w-24",
    logoClassName: "h-4 w-auto",
  },
  {
    id: "itau",
    name: "Itaú",
    Logo: ItauLogo,
    primaryColor: "#EC7000",
    logoWrapperClassName: "h-9 w-9",
    logoClassName: "h-8 w-8",
  },
  {
    id: "bradesco",
    name: "Bradesco",
    Logo: BradescoLogo,
    primaryColor: "#CC092F",
    logoWrapperClassName: "h-9 w-20",
    logoClassName: "h-4 w-auto",
  },
  {
    id: "santander",
    name: "Santander",
    Logo: SantanderLogo,
    primaryColor: "#EA1D25",
    logoWrapperClassName: "h-9 w-28",
    logoClassName: "h-4 w-auto",
  },
  {
    id: "caixa",
    name: "Caixa",
    Logo: CaixaLogo,
    primaryColor: "#005CA9",
    logoWrapperClassName: "h-9 w-20",
    logoClassName: "h-4 w-auto",
  },
  {
    id: "banco_do_brasil",
    name: "Banco do Brasil",
    Logo: BancoDoBrasilLogo,
    primaryColor: "#0038A8",
    logoWrapperClassName: "h-9 w-9",
    logoClassName: "h-8 w-8",
  },
  {
    id: "other",
    name: "Outro banco",
    Logo: CardIcon,
    primaryColor: "#4B5563",
    logoWrapperClassName: "h-9 w-9",
    logoClassName: "h-7 w-7",
  },
];

const OTHER_BANK = BANKS[BANKS.length - 1];

export function getBank(id: string): BankInfo {
  return BANKS.find((bank) => bank.id === id) ?? OTHER_BANK;
}
