import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import { Route } from "../hooks/useRouter";

type Props = {
  current: Route;
  navigate: (route: Route) => void;
  children: ReactNode;
};

export default function MainLayout({ current, navigate, children }: Props) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-primary-background text-primary-text">
      <Sidebar current={current} navigate={navigate} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-end px-6 py-3 border-b border-primary-border bg-menu-background">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
