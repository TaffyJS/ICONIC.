import { useEffect, useState, type FormEvent } from "react";
import type { Lang, Product } from "../../data";
import type { Route } from "../../types/app";

export function Header({
  lang,
  setLang,
  cartCount,
  cartPulse,
  products,
  route,
  t,
}: {
  lang: Lang;
  setLang: (lang: Lang) => void;
  cartCount: number;
  cartPulse: boolean;
  products: Product[];
  route: Route;
  t: Record<string, string>;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = route.name === "home";
  const transparent = isHome && !scrolled;
  const searchResults = searchTerm.trim()
    ? products
        .filter((product) => {
          const query = searchTerm.trim().toLowerCase();
          return Object.values(product.translations).some((copy) =>
            [copy.name, copy.category, copy.short, copy.description].some((value) => value.toLowerCase().includes(query)),
          );
        })
        .slice(0, 5)
    : [];

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 72);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function closeSearch() {
    setSearchOpen(false);
    setSearchTerm("");
  }

  function openProduct(product: Product) {
    window.location.hash = `/product/${product.id}`;
    closeSearch();
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searchResults[0]) openProduct(searchResults[0]);
  }

  return (
    <>
      <header className={`site-header ${transparent ? "is-transparent" : ""}`}>
        <a className="brand" href="#top" aria-label="ICONIC home">
          <img src="/assets/iconic-wordmark-black.png" alt="ICONIC." />
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#summer-collection">{t["nav.collection"]}</a>
          <a href="#collection">{t["nav.shop"]}</a>
          <a href="#standard">{t["nav.standard"]}</a>
          <a href="#/admin">{t["nav.admin"]}</a>
          <span className="season-nav-item" aria-label={t["nav.season"]}>
            <span className="season-nav-dot" aria-hidden="true" />
            <span>{t["nav.season"]}</span>
          </span>
        </nav>
        <div className="header-actions">
          <button className="icon-action" type="button" onClick={() => setSearchOpen((open) => !open)} aria-label={t["nav.search"]}>
            {t["nav.search"]}
          </button>
          <div className="language-switch" aria-label="Language selector">
            {(["bg", "en"] as Lang[]).map((code) => (
              <button
                className={`lang-button ${lang === code ? "is-active" : ""}`}
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <a className={`cart-pill ${cartPulse ? "is-pulsing" : ""}`} href="#/checkout" aria-label={`${t["nav.cart"]}: ${cartCount}`}>
            <span>{t["nav.cart"]}</span>
            <strong>{cartCount}</strong>
          </a>
          <button className="menu-action" type="button" onClick={() => setMenuOpen(true)} aria-label={t["nav.menu"]}>
            {t["nav.menu"]}
          </button>
        </div>
        <div className={`search-panel ${searchOpen ? "is-open" : ""}`}>
          <form onSubmit={submitSearch}>
            <label>
              <span>{t["nav.searchLabel"]}</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t["nav.searchPlaceholder"]}
              />
            </label>
            <button type="submit" disabled={searchResults.length === 0}>
              {t["nav.searchGo"]}
            </button>
          </form>
          <button type="button" onClick={closeSearch} aria-label={t["nav.close"]}>
            {t["nav.close"]}
          </button>
          <div className="search-results">
            {searchTerm.trim() && searchResults.length === 0 ? <span>{t["nav.searchEmpty"]}</span> : null}
            {searchResults.map((product) => (
              <button key={product.id} type="button" onClick={() => openProduct(product)}>
                <img src={product.gallery[0]} alt="" />
                <span>{product.translations[lang].name}</span>
                <small>{product.translations[lang].category}</small>
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className={`mobile-menu-backdrop ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-head">
          <span>{t["nav.menu"]}</span>
          <button type="button" onClick={() => setMenuOpen(false)}>
            {t["nav.close"]}
          </button>
        </div>
        <div className="mobile-season">
          <span />
          <strong>{t["nav.seasonFull"]}</strong>
          <small>{t["nav.seasonText"]}</small>
        </div>
        <nav>
          <a href="#top" onClick={() => setMenuOpen(false)}>{t["nav.home"]}</a>
          <a href="#summer-collection" onClick={() => setMenuOpen(false)}>{t["nav.collection"]}</a>
          <a href="#collection" onClick={() => setMenuOpen(false)}>{t["nav.shop"]}</a>
          <a href="#/checkout" onClick={() => setMenuOpen(false)}>{t["nav.cart"]}</a>
          <a href="#/admin" onClick={() => setMenuOpen(false)}>{t["nav.admin"]}</a>
        </nav>
      </aside>
    </>
  );
}
