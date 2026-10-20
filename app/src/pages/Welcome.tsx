import { Route } from "../hooks/useRouter";
import Button from "../components/Button";
import Logo from "../assets/icons/logo.svg?react";

type Props = {
  navigate: (route: Route) => void;
};

export default function Welcome({ navigate }: Props) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-primary-background text-primary-text">
      <div className="flex max-w-sm flex-col items-center gap-6 text-center">
        <Logo className="h-50 w-50" role="img" aria-label="Logo Solaris" />
        <div className="flex flex-col gap-10">
          <h1 className="text-3xl font-bold text-primary-text">Solaris</h1>
          <Button onClick={() => navigate("dashboard")}>Começar</Button>
        </div>
      </div>
    </div>
  );
}
