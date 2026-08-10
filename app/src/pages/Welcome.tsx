import { Route } from "../hooks/useRouter";
import Button from "../components/Button";

type Props = {
  navigate: (route: Route) => void;
};

export default function Welcome({ navigate }: Props) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-primary-background text-primary-text">
      <div className="flex max-w-sm flex-col items-center gap-6 text-center">
        <img src="/icons/logo.svg" alt="Logo" className="h-16 w-16" />
        <div className="flex flex-col gap-10">
          <h1 className="text-3xl font-bold text-primary-text">Solaris</h1>
          <Button onClick={() => navigate("dashboard")}>Começar</Button>
        </div>
      </div>
    </div>
  );
}
