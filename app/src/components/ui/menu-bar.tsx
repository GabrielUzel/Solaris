import { Link } from "react-router-dom";
import { useTheme } from "../../utils/theme";
import { formatDate } from "../../utils/format-date";
import logoIcon from "../../assets/logo/solaris-logo-icon.svg";
import { Icon } from "./icon";
import Button from "./button";
import sun from "../../assets/icons/sun.svg";
import moon from "../../assets/icons/moon.svg";

export default function MenuBar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-menu-background border-b border-primary-border shadow-default z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <Link
          to="/home"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Icon src={logoIcon} alt="Solaris" width={50} height={50} />
        </Link>

        <div className="flex gap-8 items-center">
          <p className="text-sm">{formatDate(new Date(), "long")}</p>
          <Button
            variant="ghost"
            children={null}
            icon={{
              src: isDark ? moon : sun,
              alt: isDark ? "Lua" : "Sol",
              width: 20,
              height: 20,
            }}
            onClick={toggleTheme}
          />
        </div>
      </div>
    </nav>
  );
}
