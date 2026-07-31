import { Route } from "../hooks/useRouter";

type Props = {
  navigate: (route: Route) => void;
};

export default function Welcome({ navigate }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-primary-background text-primary-text">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <img src="/icons/logo.svg" alt="Solaris" className="w-16 h-16" />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary-text">Solaris</h1>
          <p className="text-secondary-text text-sm">
            Controle financeiro pessoal simples e direto.
          </p>
        </div>
        <button
          onClick={() => navigate("dashboard")}
          className="mt-2 px-6 py-3 rounded-xl text-sm font-semibold text-inverted-text bg-button-background hover:bg-button-hover transition-colors"
        >
          Começar
        </button>
      </div>
    </div>
  );
}
