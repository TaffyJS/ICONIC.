import { products, type Lang, type Product } from "../../data";
import type { ContentSlug } from "../../types/app";

type ContentBlock = {
  title: string;
  text: string;
  kicker?: string;
  items?: string[];
};

type ContentStat = {
  value: string;
  label: string;
  text: string;
};

type ContentPageData = {
  label: string;
  title: string;
  intro: string;
  image: string;
  sections: ContentBlock[];
  stats?: ContentStat[];
  steps?: ContentBlock[];
  table?: {
    columns: string[];
    rows: string[][];
  };
  productIds?: string[];
  giftValues?: Array<{
    amount: string;
    text: string;
  }>;
  contactRows?: Array<{
    label: string;
    value: string;
    href?: string;
  }>;
  journalPosts?: ContentBlock[];
  showMap?: boolean;
};

export default function ContentPage({ slug, lang, t }: { slug: ContentSlug; lang: Lang; t: Record<string, string> }) {
  const page = getContentPage(slug, lang);
  const pageProducts = page.productIds
    ?.map((productId) => products.find((product) => product.id === productId))
    .filter((product): product is Product => Boolean(product));

  return (
    <section className="content-page">
      <div className="content-hero">
        <div>
          <a className="back-link" href="#top">
            {t["page.back"]}
          </a>
          <div className="section-label">{page.label}</div>
          <h2>{page.title}</h2>
          <p className="lead compact">{page.intro}</p>
        </div>
        <img src={page.image} alt={page.title} />
      </div>

      {page.stats && (
        <div className="content-stats">
          {page.stats.map((stat) => (
            <div key={`${stat.value}-${stat.label}`}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <p>{stat.text}</p>
            </div>
          ))}
        </div>
      )}

      {pageProducts && (
        <div className="content-product-grid">
          {pageProducts.map((product) => {
            const copy = product.translations[lang];
            return (
              <article className="content-product" key={product.id}>
                <img src={product.gallery[0]} alt={copy.name} />
                <div>
                  <span>{copy.category}</span>
                  <h3>{copy.name}</h3>
                  <p>{copy.description}</p>
                  <a className="button button-dark" href={`#/product/${product.id}`}>
                    {t["product.view"]}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {page.giftValues && (
        <div className="gift-grid">
          {page.giftValues.map((gift) => (
            <article className="gift-card" key={gift.amount}>
              <span>{gift.amount}</span>
              <p>{gift.text}</p>
            </article>
          ))}
        </div>
      )}

      {page.sections.length > 0 && (
        <div className="content-grid">
          {page.sections.map((block) => (
            <article className="content-card" key={block.title}>
              {block.kicker && <span>{block.kicker}</span>}
              <h3>{block.title}</h3>
              <p>{block.text}</p>
              {block.items && (
                <ul>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}

      {page.steps && (
        <div className="content-timeline">
          {page.steps.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {page.table && (
        <div className="size-table">
          <table>
            <thead>
              <tr>
                {page.table.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.table.rows.map((row) => (
                <tr key={row.join("-")}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(page.contactRows || page.showMap) && (
        <div className="contact-layout">
          {page.contactRows && (
            <div className="contact-panel">
              {page.contactRows.map((row) => (
                <div key={row.label}>
                  <span>{row.label}</span>
                  {row.href ? <a href={row.href}>{row.value}</a> : <strong>{row.value}</strong>}
                </div>
              ))}
            </div>
          )}
          {page.showMap && (
            <div className="map-panel" aria-label="Gabrovo Bulgaria map">
              <iframe
                title="Gabrovo, Bulgaria"
                src="https://www.openstreetmap.org/export/embed.html?bbox=25.285%2C42.835%2C25.345%2C42.895&layer=mapnik&marker=42.8746%2C25.3189"
              />
            </div>
          )}
        </div>
      )}

      {page.journalPosts && (
        <div className="journal-grid">
          {page.journalPosts.map((post) => (
            <article key={post.title}>
              <span>{post.kicker}</span>
              <h3>{post.title}</h3>
              <p>{post.text}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function getContentPage(slug: ContentSlug, lang: Lang): ContentPageData {
  const bg = lang === "bg";
  const text = (bgText: string, enText: string) => (bg ? bgText : enText);

  const pages: Record<ContentSlug, ContentPageData> = {
    "new-arrivals": {
      label: text("Нов сезон", "New season"),
      title: text("Нови продукти", "New Arrivals"),
      intro: text(
        "Първият сезонен drop събира леки материи, relaxed силуети и малки серии. Тук можеш да видиш как новите модели влизат в магазина преди да станат част от основната колекция.",
        "The first seasonal drop brings together light fabrics, relaxed silhouettes, and small production runs. This page shows how new styles enter the store before joining the core collection.",
      ),
      image: products[0].gallery[1],
      productIds: ["relaxed-shirt", "easy-trouser", "core-tee"],
      stats: [
        { value: "03", label: text("модела", "styles"), text: text("Първа капсула за топли дни.", "A first capsule for warm days.") },
        { value: "54", label: text("бройки", "pieces"), text: text("Планирани малки количества.", "Planned in small quantities.") },
        { value: "48h", label: text("подготовка", "prep"), text: text("Проверка и опаковане преди изпращане.", "Checked and packed before dispatch.") },
      ],
      sections: [
        {
          kicker: text("Drop логика", "Drop logic"),
          title: text("Ново, но не шумно", "New, but not loud"),
          text: text(
            "ICONIC добавя модели сезонно, когато има ясна причина: материя, която работи добре, кройка с движение или продукт, който допълва вече съществуващите дрехи.",
            "ICONIC adds styles seasonally when there is a clear reason: a fabric that works, a cut with movement, or a piece that completes the existing wardrobe.",
          ),
        },
        {
          kicker: text("Наличност", "Availability"),
          title: text("Малък тираж", "Small run"),
          text: text(
            "Новите продукти не се държат в голям склад. Следим интереса, размерите и обратната връзка, преди да повторим или променим даден модел.",
            "New arrivals are not held in large warehouse stock. Demand, sizing, and feedback guide whether a style is repeated or adjusted.",
          ),
        },
      ],
    },
    "gift-cards": {
      label: text("Подаръци", "Gifting"),
      title: text("Подаръчни карти", "Gift Cards"),
      intro: text(
        "Подаръчната карта е за хора, които харесват ICONIC, но искат сами да изберат точния размер, цвят или следващ drop. В бъдещ checkout тя може да работи като дигитален код.",
        "A gift card is for someone who likes ICONIC but wants to choose the exact size, color, or next drop themselves. In a future checkout it can work as a digital code.",
      ),
      image: "/assets/iconic-logo-tile.png",
      giftValues: [
        { amount: "€25", text: text("Малък жест за тениска, доставка или част от по-голяма поръчка.", "A small gesture toward a tee, shipping, or part of a larger order.") },
        { amount: "€50", text: text("Практичен избор за основен модел от първата линия.", "A practical choice toward a core piece from the first line.") },
        { amount: "€100", text: text("Подарък за завършен летен комплект или бъдещ сезонен drop.", "A gift toward a full summer outfit or future seasonal drop.") },
      ],
      sections: [
        {
          title: text("Как се получава", "How it arrives"),
          text: text(
            "Картата е замислена като дигитален продукт: получателят взима код по имейл или съобщение, а ти можеш да добавиш кратко лично послание.",
            "The card is designed as a digital product: the recipient gets a code by email or message, and you can add a short personal note.",
          ),
          items: [text("Без физическа доставка", "No physical delivery"), text("Валидна за всички категории", "Valid across categories"), text("Лесна за бъдещ Stripe checkout", "Ready for a future Stripe checkout")],
        },
      ],
    },
    shipping: {
      label: text("Помощ", "Help"),
      title: text("Доставка", "Shipping"),
      intro: text(
        "Доставката е планирана за България с избор между адрес и офис на куриер. Целта е процесът да бъде ясен, бърз и лесен за проследяване от момента на поръчката.",
        "Shipping is planned for Bulgaria with a choice between door delivery and courier office pickup. The goal is a clear, fast, trackable process from the moment of order.",
      ),
      image: products[1].gallery[1],
      sections: [
        {
          title: text("До адрес", "Door delivery"),
          text: text("Подходящо за София, Габрово и останалите градове, когато искаш пратката да дойде директно до теб.", "Best when you want the parcel delivered directly to your address."),
          items: [text("Очакван срок: 1-2 работни дни", "Expected time: 1-2 business days"), text("Демо цена: €3", "Demo price: €3")],
        },
        {
          title: text("До офис", "Courier office pickup"),
          text: text("По-гъвкав вариант, ако предпочиташ да вземеш поръчката, когато имаш време.", "A flexible option if you prefer picking up the order when it suits you."),
          items: [text("Очакван срок: 1-2 работни дни", "Expected time: 1-2 business days"), text("Демо цена: €2", "Demo price: €2")],
        },
      ],
      steps: [
        { title: text("Поръчка", "Order"), text: text("Получаваме избраните модели, размери и метод за доставка.", "We receive the selected styles, sizes, and delivery method.") },
        { title: text("Проверка", "Check"), text: text("Артикулите се преглеждат, сгъват и опаковат преди изпращане.", "Items are checked, folded, and packed before dispatch.") },
        { title: text("Проследяване", "Tracking"), text: text("Когато реалната интеграция е готова, клиентът ще получава линк за проследяване.", "Once the real integration is live, the customer receives a tracking link.") },
      ],
    },
    "returns-exchanges": {
      label: text("Помощ", "Help"),
      title: text("Връщане и замяна", "Returns & Exchanges"),
      intro: text(
        "Политиката е замислена така, че клиентът да може спокойно да провери размера у дома. Връщането и замяната трябва да бъдат ясни, без излишни условия.",
        "The policy is designed so customers can check the size at home with confidence. Returns and exchanges should be clear, without unnecessary friction.",
      ),
      image: products[2].gallery[1],
      stats: [
        { value: "14", label: text("дни", "days"), text: text("Период за заявка след получаване.", "Request window after delivery.") },
        { value: "01", label: text("замяна", "exchange"), text: text("Бърза смяна на размер при наличност.", "Quick size swap when stock is available.") },
      ],
      sections: [
        {
          title: text("Условия", "Conditions"),
          text: text("Продуктът трябва да бъде неносен, чист, без следи от пране и с оригинална опаковка, когато това е възможно.", "The piece should be unworn, clean, unwashed, and in original packaging where possible."),
          items: [text("Без парфюм или петна", "No perfume or stains"), text("Запазени етикети", "Tags kept"), text("Снимка при дефект", "Photo required for defects")],
        },
        {
          title: text("Замяна на размер", "Size exchange"),
          text: text("Ако размерът не е точен, първо проверяваме наличността. При лимитирани серии замяната може да зависи от оставащите бройки.", "If the size is not right, stock is checked first. With limited runs, exchanges depend on remaining pieces."),
        },
      ],
      steps: [
        { title: text("Пиши ни", "Contact us"), text: text("Изпрати номер на поръчка, продукт и желания размер.", "Send the order number, product, and preferred size.") },
        { title: text("Потвърждение", "Confirmation"), text: text("Получаваш инструкции за куриер и адрес/офис за връщане.", "You receive courier instructions and return address/office details.") },
        { title: text("Финализиране", "Completion"), text: text("След преглед връщаме сумата или изпращаме новия размер.", "After inspection, we refund or send the replacement size.") },
      ],
    },
    "size-guide": {
      label: text("Помощ", "Help"),
      title: text("Размери", "Size Guide"),
      intro: text(
        "Това е примерна таблица за първите relaxed модели. Измерванията са ориентировъчни и са дадени, за да помогнат при избор между два размера.",
        "This is an example guide for the first relaxed styles. Measurements are approximate and help when choosing between two sizes.",
      ),
      image: products[0].gallery[2],
      table: {
        columns: [text("Размер", "Size"), text("Гръдна обиколка", "Chest"), text("Талия", "Waist"), text("Ханш", "Hip"), text("Ръст", "Height")],
        rows: [
          ["XS", "82-88 cm", "64-70 cm", "86-92 cm", "155-165 cm"],
          ["S", "88-94 cm", "70-76 cm", "92-98 cm", "165-172 cm"],
          ["M", "94-100 cm", "76-84 cm", "98-104 cm", "172-180 cm"],
          ["L", "100-108 cm", "84-92 cm", "104-112 cm", "180-188 cm"],
          ["XL", "108-116 cm", "92-102 cm", "112-120 cm", "188-195 cm"],
        ],
      },
      sections: [
        {
          title: text("Как да мериш", "How to measure"),
          text: text("Измери върху тялото без да стягаш сантиметъра. За relaxed fit избери по-малкия размер за по-чист силует или по-големия за повече въздух.", "Measure around the body without pulling the tape tight. For relaxed fit, choose the smaller size for a cleaner silhouette or the larger size for more ease."),
        },
        {
          title: text("Между два размера", "Between sizes"),
          text: text("Ризата и тениската позволяват повече свобода. При панталона избери според талията и ханша, защото там усещането е най-важно.", "The shirt and tee allow more freedom. For trousers, choose by waist and hip because that is where the feel matters most."),
        },
      ],
    },
    contact: {
      label: text("Помощ", "Help"),
      title: text("Контакт", "Contact"),
      intro: text(
        "Свържи се с ICONIC за въпроси за размери, наличности, поръчки, партньорства или следващия drop. Марката е базирана около G-Town/Gabrovo ритъм и работи с малки сезонни серии.",
        "Contact ICONIC for sizing, stock, order, partnership, or next-drop questions. The brand is built around a G-Town/Gabrovo rhythm and small seasonal runs.",
      ),
      image: "/assets/iconic-editorial.png",
      contactRows: [
        { label: text("Телефон", "Phone"), value: "+359896644573", href: "tel:+359896644573" },
        { label: text("Локация", "Location"), value: text("Габрово, България", "Gabrovo, Bulgaria") },
        { label: "Instagram", value: "@iconic.gtown" },
      ],
      showMap: true,
      sections: [
        {
          title: text("За поръчки", "For orders"),
          text: text("Изпрати номер на поръчка, име и кратко описание. Така можем да проверим статуса, доставката или нужда от промяна по-бързо.", "Send your order number, name, and a short note so we can check status, delivery, or change requests faster."),
        },
        {
          title: text("За размери", "For sizing"),
          text: text("Кажи височина, приблизителни мерки и желания силует. Ще препоръчаме размер според конкретния модел.", "Share height, approximate measurements, and preferred silhouette. We will recommend a size for the specific style."),
        },
      ],
    },
    "the-fabric": {
      label: text("За нас", "About"),
      title: text("Материята", "The Fabric"),
      intro: text(
        "ICONIC започва от усещането на материята: дишаща, подредена и достатъчно стабилна, за да не изглежда дрехата случайна след първия час носене.",
        "ICONIC starts with fabric feel: breathable, composed, and stable enough that the garment does not look accidental after the first hour of wear.",
      ),
      image: products[1].gallery[2],
      sections: [
        {
          title: text("Ленени смеси", "Linen blends"),
          text: text("Ленът дава въздух и сезонност, а смесите добавят мекота и по-лесна грижа. Целта е летни дрехи, които не изглеждат прекалено официални.", "Linen brings air and seasonality, while blends add softness and easier care. The goal is summer clothing that does not feel overly formal."),
        },
        {
          title: text("Памук за основи", "Cotton for essentials"),
          text: text("Основните тениски разчитат на памук със стабилна структура, за да се носят самостоятелно или под риза без да губят форма.", "Core tees use cotton with a stable structure so they can be worn alone or under a shirt without losing shape."),
        },
        {
          title: text("Проверка преди производство", "Pre-production check"),
          text: text("Материите се преглеждат за допир, плътност, падане и поведение след грижа. Ако не работят в реално ежедневие, не влизат в серия.", "Fabrics are reviewed for touch, weight, drape, and care behavior. If they do not work in daily wear, they do not enter production."),
        },
      ],
    },
    "g-town-studio": {
      label: text("За нас", "About"),
      title: text("G-Town студио", "G-Town Studio"),
      intro: text(
        "G-Town Studio е работният център на ICONIC: място за идеи, кройки, ръчни проверки и подготовка на малки сезонни серии.",
        "G-Town Studio is ICONIC's working center: a place for ideas, patterns, manual checks, and preparation of small seasonal runs.",
      ),
      image: "/assets/iconic-hero.png",
      stats: [
        { value: "Small", label: text("серии", "runs"), text: text("Производството остава контролирано.", "Production stays controlled.") },
        { value: "G", label: "Town", text: text("Местен ритъм, сезонна работа.", "Local rhythm, seasonal work.") },
        { value: "QC", label: text("проверка", "checks"), text: text("Всяка бройка се преглежда преди изпращане.", "Each piece is reviewed before dispatch.") },
      ],
      sections: [
        {
          title: text("Как работи студиото", "How the studio works"),
          text: text("Първо се избира материя, после се тества кройка и чак след това се планира малко количество. Това пази марката от излишен склад и помага за по-добър контрол.", "Fabric is selected first, then the cut is tested, and only then a small quantity is planned. This avoids excess stock and improves control."),
        },
        {
          title: text("Лимитирана продукция", "Limited production"),
          text: text("Лимитираният stock не е само маркетинг. Той позволява да се реагира на реална обратна връзка, вместо да се произвеждат големи количества преди да знаем какво работи.", "Limited stock is not just marketing. It allows the brand to react to real feedback instead of producing large quantities before knowing what works."),
        },
      ],
    },
    journal: {
      label: text("За нас", "About"),
      title: text("Журнал", "Journal"),
      intro: text(
        "Журналът е място за кратки бележки за нови drop-ове, материали, styling идеи и решенията зад малката сезонна продукция.",
        "The journal is a place for short notes on drops, materials, styling ideas, and the decisions behind small seasonal production.",
      ),
      image: products[2].gallery[2],
      sections: [],
      journalPosts: [
        {
          kicker: text("Drop 01", "Drop 01"),
          title: text("Защо започваме с три модела", "Why we start with three styles"),
          text: text("Риза, панталон и тениска са достатъчно ясна основа, за да покажат силуета на марката без да размиват фокуса.", "A shirt, trouser, and tee are enough to show the brand silhouette without diluting the focus."),
        },
        {
          kicker: text("Материя", "Fabric"),
          title: text("Ленът като летен ритъм", "Linen as a summer rhythm"),
          text: text("Ленените смеси носят въздух и лекота, но остават по-практични за ежедневието от чисто официалните материи.", "Linen blends bring air and ease while staying more practical for daily wear than overly formal fabrics."),
        },
        {
          kicker: text("Студио", "Studio"),
          title: text("Малко производство, по-добри решения", "Small production, better decisions"),
          text: text("Когато серията е малка, всяка обратна връзка влияе на следващия сезон: размери, дължини, плътност и цветове.", "When the run is small, every piece of feedback shapes the next season: sizing, lengths, weight, and colors."),
        },
      ],
    },
    sustainability: {
      label: text("За нас", "About"),
      title: text("Устойчивост", "Sustainability"),
      intro: text(
        "За ICONIC устойчивостта започва с по-малки количества, по-добро планиране и дрехи, които не са направени само за една снимка или един уикенд.",
        "For ICONIC, sustainability starts with smaller quantities, better planning, and clothing that is not made only for one photo or one weekend.",
      ),
      image: "/assets/iconic-editorial.png",
      stats: [
        { value: "Less", label: text("склад", "stock"), text: text("Произвеждаме по-близо до реалното търсене.", "Production stays closer to real demand.") },
        { value: "More", label: text("носене", "wear"), text: text("Фокус върху ежедневни дрехи с дълъг живот.", "Focus on daily pieces with longer use.") },
        { value: "Clear", label: text("контрол", "control"), text: text("Малките серии се проверяват по-лесно.", "Small runs are easier to check.") },
      ],
      sections: [
        {
          title: text("Сезонно, не свръхпроизводство", "Seasonal, not overproduced"),
          text: text("Колекциите се планират като капсули, а не като безкраен поток от артикули. Това помага да се избегнат ненужни количества.", "Collections are planned as capsules, not an endless stream of items. This helps avoid unnecessary quantities."),
        },
        {
          title: text("По-дълъг живот", "Longer use"),
          text: text("Чистите линии и спокойните цветове са избрани така, че дрехите да могат да останат в гардероба повече от сезон.", "Clean lines and calm colors are chosen so pieces can stay in the wardrobe beyond one season."),
        },
      ],
    },
  };

  return pages[slug];
}
