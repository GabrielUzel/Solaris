import logo from "../assets/logo/solaris-logo.svg";
import arrowRight from "../assets/icons/arrow-right.svg";
import Button from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-primary-background text-primary-text flex flex-col justify-center items-center gap-8">
      <div className="flex flex-col items-center justify-center gap-2">
        <img className="w-100 h-40" src={logo} alt="Solaris Logo" />
        <p className="text-2xl">Bem vindo!</p>
      </div>
      <Button
        variant="primary"
        icon={{ src: arrowRight, alt: "Seta a direita", width: 20, height: 20 }}
        iconPosition="right"
        onClick={() => navigate("/home")}
      >
        Iniciar
      </Button>
    </main>
  );
}
