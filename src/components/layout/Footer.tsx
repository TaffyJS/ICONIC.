type FooterLink = {
  label: string;
  href: string;
};

export function Footer({ t }: { t: Record<string, string> }) {
  const footerGroups: Array<{ title: string; links: FooterLink[] }> = [
    {
      title: t["footer.shop"],
      links: [
        { label: t["footer.shop1"], href: "#summer-collection" },
        { label: t["footer.shop2"], href: "#best-sellers" },
        { label: t["footer.shop3"], href: "#/new-arrivals" },
        { label: t["footer.shop4"], href: "#/gift-cards" },
      ],
    },
    {
      title: t["footer.help"],
      links: [
        { label: t["footer.help1"], href: "#/shipping" },
        { label: t["footer.help2"], href: "#/returns-exchanges" },
        { label: t["footer.help3"], href: "#/size-guide" },
        { label: t["footer.help4"], href: "#/contact" },
      ],
    },
    {
      title: t["footer.about"],
      links: [
        { label: t["footer.about1"], href: "#/the-fabric" },
        { label: t["footer.about2"], href: "#/g-town-studio" },
        { label: t["footer.about3"], href: "#/journal" },
        { label: t["footer.about4"], href: "#/sustainability" },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src="/assets/iconic-wordmark-white.png" alt="ICONIC." />
        <strong>{t["footer.kicker"]}</strong>
        <p>{t["footer.text"]}</p>
      </div>
      <div className="footer-links">
        {footerGroups.map((group) => (
          <div className="footer-column" key={group.title}>
            <h3>{group.title}</h3>
            {group.links.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>{t["footer.rights"]}</span>
        <span>{t["footer.made"]}</span>
      </div>
    </footer>
  );
}
