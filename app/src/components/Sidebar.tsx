import { Route } from "../hooks/useRouter";
import Dashboard from "../assets/icons/dashboard.svg?react";
import Category from "../assets/icons/category.svg?react";
import Card from "../assets/icons/card.svg?react";
import ThemeToggle from "../components/ThemeToggle";

type NavItem = {
  label: string;
  route: Route;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { label: "Dashboard", route: "dashboard", Icon: Dashboard },
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
        <img src="/icons/logo.svg" alt="Solaris" className="h-7 w-7" />
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

        <div className="mt-auto flex justify-end px-3 pb-4">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
