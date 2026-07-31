import "./App.css";
import { useRouter } from "./hooks/useRouter";
import { useTheme } from "./hooks/useTheme";
import MainLayout from "./layouts/MainLayout";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Cards from "./pages/Cards";

function App() {
  const { route, navigate } = useRouter("welcome");
  useTheme();

  if (route === "welcome") {
    return <Welcome navigate={navigate} />;
  }

  const pages = {
    dashboard: <Dashboard />,
    categories: <Categories />,
    cards: <Cards />,
  };

  return (
    <MainLayout current={route} navigate={navigate}>
      {pages[route]}
    </MainLayout>
  );
}

export default App;
