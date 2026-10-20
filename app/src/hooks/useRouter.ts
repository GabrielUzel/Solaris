import { useState } from "react";

export type Route =
  "welcome" | "dashboard" | "categories" | "cards" | "investments" | "settings";

export function useRouter(initial: Route = "welcome") {
  const [route, setRoute] = useState<Route>(initial);
  return { route, navigate: setRoute };
}
