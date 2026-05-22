"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { en } from "./translations/en";
import { th } from "./translations/th";
import type { Translations } from "./translations/en";

export type Language = "en" | "th";

const translations: Record<Language, Translations> = { en, th };

const LANG_KEY = "mini_erp_lang";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "th",
  setLang: () => {},
  t: th,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("th");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Language | null;
    if (saved === "en" || saved === "th") setLangState(saved);
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

export function interpolate(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ""));
}
