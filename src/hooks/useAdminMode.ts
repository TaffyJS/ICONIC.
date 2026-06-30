import { useEffect } from "react";
import type { Route } from "../types/app";

export function useAdminMode(routeName: Route["name"]) {
  useEffect(() => {
    document.body.classList.toggle("admin-mode", routeName === "admin" || routeName === "adminAddItem");
    return () => document.body.classList.remove("admin-mode");
  }, [routeName]);
}
