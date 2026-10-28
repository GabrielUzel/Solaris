import { Route } from "../hooks/useRouter";
import Dashboard from "../assets/icons/dashboard.svg?react";
import Category from "../assets/icons/category.svg?react";
import Card from "../assets/icons/card.svg?react";
import Logo from "../assets/icons/logo.svg?react";
import Investment from "../assets/icons/investment.svg?react";
import History from "../assets/icons/history.svg?react";
import ThemeToggle from "../components/ThemeToggle";

type NavItem = {
  label: string;
  route: Route;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { label: "Dashboard", route: "dashboard", Icon: Dashboard },
  { label: "Investimentos", route: "investments", Icon: Investment },
  { label: "Histórico", route: "history", Icon: History },
  { label: "Categorias", route: "categories", Icon: Category },
  { label: "Cartões", route: "cards", Icon: Card },
];

type Props = {
  current: Route;
  navigate: (route: Route) => void;
};

export default function Sidebar({ current, navigate }: Props) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-primary-border bg-menu-background">
      <div className="flex items-center gap-2 border-b border-primary-border px-5 py-5">
        <Logo className="h-10 w-10" role="img" aria-label="Logo Solaris" />
        <span className="text-lg font-semibold tracking-tight text-primary-text">
          Solaris
        </span>
      </div>

      <div className="flex h-full flex-col">
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map(({ Icon, ...item }) => (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={[
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                current === item.route
                  ? "bg-hover-background text-primary"
                  : "text-secondary-text hover:bg-hover-background hover:text-primary-text",
              ].join(" ")}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex justify-between gap-1 px-3 pb-4">
          <button
            type="button"
            onClick={() => navigate("settings")}
            aria-label="Configurações"
            className={[
              "rounded-lg p-1.5 transition-colors",
              current === "settings"
                ? "text-primary"
                : "text-secondary-text hover:bg-hover-background hover:text-primary-text",
            ].join(" ")}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M16.2 10c0-.34-.03-.67-.08-1l1.6-1.25a.4.4 0 0 0 .1-.5l-1.52-2.63a.4.4 0 0 0-.49-.17l-1.89.76a7.44 7.44 0 0 0-1.73-1l-.28-2.01A.4.4 0 0 0 11.5 2h-3a.4.4 0 0 0-.4.34l-.28 2a7.44 7.44 0 0 0-1.73 1l-1.89-.76a.4.4 0 0 0-.49.17L2.19 7.25a.4.4 0 0 0 .1.5L3.88 9c-.05.33-.08.66-.08 1s.03.67.08 1l-1.6 1.25a.4.4 0 0 0-.1.5l1.52 2.63c.1.17.3.24.49.17l1.89-.76c.54.38 1.12.7 1.73 1l.28 2.01c.05.2.22.34.4.34h3c.19 0 .35-.14.4-.34l.28-2a7.44 7.44 0 0 0 1.73-1l1.89.76c.19.07.39 0 .49-.17l1.52-2.63a.4.4 0 0 0-.1-.5L16.12 11c.05-.33.08-.66.08-1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
