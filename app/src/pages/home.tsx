import MainTable from "../components/main-table/main-table";
import MenuBar from "../components/ui/menu-bar";

export default function Home() {
  return (
    <div className="min-h-screen bg-primary-background text-primary-text">
      <MenuBar />
      <div className="pt-30 px-10 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-secondary-text">Visão geral das suas finanças</p>
        </div>
        <MainTable />
      </div>
    </div>
  );
}
