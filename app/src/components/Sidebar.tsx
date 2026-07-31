import { Route } from "../hooks/useRouter";

type NavItem = {
  label: string;
  route: Route;
  icon: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", route: "dashboard", icon: "dashboard" },
  { label: "Categorias", route: "categories", icon: "category" },
  { label: "Cartões", route: "cards", icon: "card" },
];

type Props = {
  current: Route;
  navigate: (route: Route) => void;
};

export default function Sidebar({ current, navigate }: Props) {
  return (
    <aside className="flex flex-col w-56 h-full bg-menu-background border-r border-primary-border shrink-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-primary-border">
        <img src="/icons/logo.svg" alt="Solaris" className="w-7 h-7" />
        <span className="text-lg font-semibold text-primary-text tracking-tight">
          Solaris
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <button
            key={item.route}
            onClick={() => navigate(item.route)}
            className={[
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left",
              current === item.route
                ? "bg-hover-background text-primary"
                : "text-secondary-text hover:bg-hover-background hover:text-primary-text",
            ].join(" ")}
          >
            <img
              src={`/icons/${item.icon}.svg`}
              alt={item.label}
              className="w-5 h-5 opacity-70"
            />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
