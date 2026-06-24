import type { Lang } from "../../data";

export function Header({
  lang,
  setLang,
  cartCount,
  cartPulse,
  t,
}: {
  lang: Lang;
  setLang: (lang: Lang) => void;
  cartCount: number;
  cartPulse: boolean;
  t: Record<string, string>;
}) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="ICONIC home">
        <img src="/assets/iconic-wordmark-black.png" alt="ICONIC." />
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#collection">{t["nav.collection"]}</a>
        <a href="#standard">{t["nav.standard"]}</a>
        <a href="#/checkout">{t["nav.checkout"]}</a>
        <a href="#/admin">{t["nav.admin"]}</a>
      </nav>
      <div className="header-actions">
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
      </div>
    </header>
  );
}
