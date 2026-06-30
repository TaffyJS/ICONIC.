import { useEffect } from "react";
import type { Route } from "../types/app";

export function useScrollRestoration(route: Route) {
  useEffect(() => {
    if (route.name === "home" && window.location.hash && !window.location.hash.startsWith("#/")) {
      const targetId = window.location.hash.replace(/^#/, "") || "top";
      window.setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [route]);
}
