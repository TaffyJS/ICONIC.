import { useEffect, useState } from "react";
import type { Route } from "../types/app";
import { getRoute } from "../utils/routing";

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => getRoute());

  useEffect(() => {
    const updateRoute = () => setRoute(getRoute());
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  return route;
}
