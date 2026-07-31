import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
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
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
