import { useState } from "react";
import type { Lang } from "../data";
import { languageStorageKey } from "../config/storage";

export function useLanguage() {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem(languageStorageKey);
    return stored === "en" ? "en" : "bg";
  });

  function changeLanguage(nextLang: Lang) {
    setLang(nextLang);
    localStorage.setItem(languageStorageKey, nextLang);
    document.documentElement.lang = nextLang;
  }

  return { lang, changeLanguage };
}
