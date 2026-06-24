import { useState } from "react";
import { adminOrders, adminReviews, adminStock } from "../../data";
import { formatPrice } from "../../utils/format";
import type { getAdminStats } from "./adminUtils";

export default function AdminPanel({
  stats,
  t,
}: {
  stats: ReturnType<typeof getAdminStats>;
  t: Record<string, string>;
}) {
  const [adminTab, setAdminTab] = useState<"overview" | "stock" | "orders" | "delivery" | "reviews">("overview");
  const lowStockProducts = adminStock.slice().sort((a, b) => a.total - b.total).slice(0, 3);
  const flaggedReviews = adminReviews.filter((review) => review.flagged);
  const completedOrders = adminOrders.filter((order) => order.status === "Delivered");
  const activeOrders = adminOrders.filter((order) => order.status !== "Delivered" && order.status !== "Cancelled");
  const completedRevenueBgn = completedOrders.reduce((sum, order) => sum + Number.parseFloat(order.totalBgn), 0);
  const openRevenueBgn = activeOrders.reduce((sum, order) => sum + Number.parseFloat(order.totalBgn), 0);
  const averageRating =
    adminReviews.length > 0
      ? (adminReviews.reduce((sum, review) => sum + review.rating, 0) / adminReviews.length).toFixed(1)
      : "0.0";
  const totalStock = adminStock.reduce((sum, item) => sum + item.total, 0);
  const deliveryAddressCount = adminOrders.filter((order) => order.deliveryMethod === "Address").length;
  const deliveryOfficeCount = adminOrders.filter((order) => order.deliveryMethod === "Office").length;
  const cardCount = adminOrders.filter((order) => order.payment === "Card").length;
  const codCount = adminOrders.filter((order) => order.payment === "Cash on delivery").length;
  const completedStatusData: Array<{ label: string; value: number; tone: "sand" | "moss" | "clay" }> = [
    { label: "Delivered", value: completedOrders.length, tone: "sand" },
    { label: "Card", value: completedOrders.filter((order) => order.payment === "Card").length, tone: "moss" },
    {
      label: "Cash on delivery",
      value: completedOrders.filter((order) => order.payment === "Cash on delivery").length,
      tone: "clay",
    },
  ];
  const activeStatusData: Array<{ label: string; value: number; tone: "sand" | "moss" | "clay" }> = [
    { label: "Processing", value: adminOrders.filter((order) => order.status === "Processing").length, tone: "sand" },
    { label: "In transit", value: adminOrders.filter((order) => order.status === "In transit").length, tone: "moss" },
    { label: "Cancelled", value: adminOrders.filter((order) => order.status === "Cancelled").length, tone: "clay" },
  ];
  const inTransitOrders = adminOrders.filter((order) => order.status === "In transit");

  return (
    <section className="admin-shell admin-dashboard">
      <div className="admin-topbar">
        <div>
          <div className="section-label">{t["admin.label"]}</div>
          <h2>{t["admin.title"]}</h2>
        </div>
        <div className="admin-pill-row">
          <StatChip label={t["admin.totalOrders"]} value={String(stats.totalOrders)} />
          <StatChip label={t["admin.revenue"]} value={formatPrice(stats.revenue)} />
          <StatChip label={t["admin.items"]} value={String(stats.items)} />
        </div>
        <a className="admin-demo-button" href="#/admin/add-item">
          {t["admin.addItem"]}
        </a>
      </div>

      <div className="admin-layout">
        <div className="admin-main admin-main-wide">
          <div className="admin-tabs" role="tablist" aria-label={t["admin.label"]}>
            {[
              ["overview", t["admin.tabOverview"]],
              ["stock", t["admin.tabStock"]],
              ["orders", t["admin.tabOrders"]],
              ["delivery", t["admin.tabDelivery"]],
              ["reviews", t["admin.tabReviews"]],
            ].map(([key, label]) => (
              <button
                className={adminTab === key ? "is-active" : ""}
                key={key}
                type="button"
                onClick={() => setAdminTab(key as "overview" | "stock" | "orders" | "delivery" | "reviews")}
              >
                {label}
              </button>
            ))}
          </div>

          {adminTab === "overview" && (
            <>
              <section className="admin-overview-row">
                <div className="sidebar-block sidebar-primary">
                  <span>{t["admin.overview"]}</span>
                  <strong>{formatPrice(stats.revenue)}</strong>
                  <p>{t["admin.text"]}</p>
                </div>
                <SplitMetric
                  label={t["admin.channelAddress"]}
                  secondLabel={t["admin.channelOffice"]}
                  first={stats.channelAddress}
                  second={stats.channelOffice}
                />
                <SplitMetric
                  label={t["admin.paymentCard"]}
                  secondLabel={t["admin.paymentCash"]}
                  first={stats.paymentCard}
                  second={stats.paymentCash}
                />
              </section>

              <section className="admin-card admin-section-card">
                <div className="card-head">
                  <div>
                    <div className="section-label">{t["admin.priority"]}</div>
                    <h3>{t["admin.overview"]}</h3>
                  </div>
                  <div className="admin-mini-stats">
                    <StatChip label={t["admin.avgRating"]} value={averageRating} />
                    <StatChip label={t["admin.totalStock"]} value={String(totalStock)} />
                  </div>
                </div>
                <div className="attention-grid">
                  <AttentionCard
                    title={t["admin.lowStock"]}
                    text={t["admin.lowStockText"]}
                    items={lowStockProducts.map((product) => `${product.product} · ${product.total}`)}
                  />
                  <AttentionCard
                    title={t["admin.reviewWatch"]}
                    text={t["admin.reviewWatchText"]}
                    items={flaggedReviews.map((review) => `${review.product} · ${review.rating}/5`)}
                  />
                </div>
              </section>

              <section className="admin-card admin-section-card">
                <div className="card-head">
                  <div>
                    <div className="section-label">{t["admin.completed"]}</div>
                    <h3>{`BGN ${completedRevenueBgn.toFixed(2)}`}</h3>
                  </div>
                  <StatChip label="Delivered" value={String(completedOrders.length)} />
                </div>
                <div className="chart-panel-grid">
                  <StatusBarChart title="Completed orders" data={completedStatusData} />
                  <MetricList
                    title="Completed split"
                    items={[
                      { label: "To address", value: String(completedOrders.filter((o) => o.deliveryMethod === "Address").length) },
                      { label: "To office", value: String(completedOrders.filter((o) => o.deliveryMethod === "Office").length) },
                      { label: "Paid by card", value: String(completedOrders.filter((o) => o.payment === "Card").length) },
                      { label: "Cash on delivery", value: String(completedOrders.filter((o) => o.payment === "Cash on delivery").length) },
                    ]}
                  />
                </div>
              </section>

              <section className="admin-card admin-section-card">
                <div className="card-head">
                  <div>
                    <div className="section-label">{t["admin.statusBoard"]}</div>
                    <h3>{`BGN ${openRevenueBgn.toFixed(2)}`}</h3>
                  </div>
                  <StatChip label={t["admin.openOrders"]} value={String(activeOrders.length)} />
                </div>
                <div className="chart-panel-grid">
                  <StatusBarChart title="Open order stages" data={activeStatusData} />
                  <MetricList
                    title="Current queue"
                    items={[
                      { label: "Processing", value: String(activeStatusData[0].value) },
                      { label: "In transit", value: String(activeStatusData[1].value) },
                      { label: "Cancelled", value: String(activeStatusData[2].value) },
                      { label: "Ready to watch", value: String(inTransitOrders.length + activeStatusData[0].value) },
                    ]}
                  />
                </div>
              </section>
            </>
          )}

          {adminTab === "stock" && (
            <section className="admin-card">
              <div className="card-head">
                <div>
                  <div className="section-label">{t["admin.stock"]}</div>
                  <h3>Size balance</h3>
                </div>
                <StatChip label={t["admin.totalStock"]} value={String(totalStock)} />
              </div>
              <DataTable
                className="stock-table"
                columns={["Product", "Category", "XS", "S", "M", "L", "XL", "Total"]}
                rows={adminStock.map((item) => [
                  item.product,
                  item.category,
                  String(item.sizes.XS),
                  String(item.sizes.S),
                  String(item.sizes.M),
                  String(item.sizes.L),
                  String(item.sizes.XL),
                  String(item.total),
                ])}
              />
            </section>
          )}

          {adminTab === "orders" && (
            <section className="admin-card">
              <div className="card-head">
                <div>
                  <div className="section-label">{t["admin.statusBoard"]}</div>
                  <h3>Order ledger</h3>
                </div>
              </div>
              <DataTable
                className="orders-table"
                columns={["Order", "Customer", "Items", "Total", "Payment", "Status", "Date"]}
                rows={adminOrders.map((order) => [
                  order.order,
                  order.customer,
                  order.items,
                  order.totalBgn,
                  order.payment,
                  order.status,
                  order.date,
                ])}
              />
            </section>
          )}

          {adminTab === "delivery" && (
            <section className="admin-card admin-section-card">
              <div className="card-head">
                <div>
                  <div className="section-label">{t["admin.delivery"]}</div>
                  <h3>Fulfilment flow</h3>
                </div>
              </div>
              <div className="delivery-admin-grid">
                <InfoPanel
                  title="By delivery method"
                  rows={[
                    { label: "Door delivery", value: `${deliveryAddressCount} orders` },
                    { label: "Courier office", value: `${deliveryOfficeCount} orders` },
                  ]}
                />
                <InfoPanel
                  title="Payment mix"
                  rows={[
                    { label: "Paid by card", value: String(cardCount) },
                    { label: "Cash on delivery", value: String(codCount) },
                  ]}
                />
                <InfoPanel
                  className="wide-panel"
                  title="In-transit shipments"
                  rows={inTransitOrders.map((order) => ({
                    label: `${order.order} · ${order.customer}`,
                    value: order.deliveryMethod,
                  }))}
                />
              </div>
            </section>
          )}

          {adminTab === "reviews" && (
            <section className="admin-card">
              <div className="card-head">
                <div>
                  <div className="section-label">{t["admin.reviews"]}</div>
                  <h3>Customer notes</h3>
                </div>
                <StatChip label={t["admin.avgRating"]} value={averageRating} />
              </div>
              <div className="review-list">
                {adminReviews.map((review) => (
                  <article className="review-card" key={`${review.customer}-${review.date}`}>
                    <div className="review-head">
                      <div>
                        <strong>{review.customer}</strong>
                        <span>{review.date}</span>
                      </div>
                      <ReviewStars rating={review.rating} />
                    </div>
                    <div className="review-meta">
                      <span>{review.product}</span>
                      {review.flagged ? <strong className="review-flag">FLAGGED</strong> : null}
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}

function AttentionCard({ title, text, items }: { title: string; text: string; items: string[] }) {
  return (
    <div className="attention-card">
      <span>{title}</span>
      <p>{text}</p>
      <div className="attention-list">
        {items.map((item) => (
          <strong key={item}>{item}</strong>
        ))}
      </div>
    </div>
  );
}

function DataTable({
  columns,
  rows,
  className = "",
}: {
  columns: string[];
  rows: string[][];
  className?: string;
}) {
  return (
    <div className={`data-table ${className}`.trim()}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SplitMetric({
  label,
  secondLabel,
  first,
  second,
}: {
  label: string;
  secondLabel: string;
  first: number;
  second: number;
}) {
  const total = Math.max(first + second, 1);
  const firstWidth = `${Math.round((first / total) * 100)}%`;
  return (
    <div className="split-metric">
      <div className="split-row">
        <span>{label}</span>
        <strong>{first}</strong>
      </div>
      <div className="split-track">
        <div style={{ width: firstWidth }} />
      </div>
      <div className="split-row">
        <span>{secondLabel}</span>
        <strong>{second}</strong>
      </div>
    </div>
  );
}

function StatusBarChart({
  title,
  data,
}: {
  title: string;
  data: Array<{ label: string; value: number; tone: "sand" | "moss" | "clay" }>;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="chart-card">
      <div className="panel-title">{title}</div>
      <div className="status-bar-chart">
        {data.map((item) => (
          <div className="status-bar-row" key={item.label}>
            <div className="status-bar-head">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="status-bar-track">
              <div
                className={`status-bar-fill tone-${item.tone}`}
                style={{ width: `${Math.max(10, Math.round((item.value / max) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricList({ title, items }: { title: string; items: Array<{ label: string; value: string }> }) {
  return (
    <div className="chart-card">
      <div className="panel-title">{title}</div>
      <div className="metric-list">
        {items.map((item) => (
          <div className="metric-list-row" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoPanel({
  title,
  rows,
  className = "",
}: {
  title: string;
  rows: Array<{ label: string; value: string }>;
  className?: string;
}) {
  return (
    <div className={`chart-card ${className}`.trim()}>
      <div className="panel-title">{title}</div>
      <div className="metric-list">
        {rows.map((row) => (
          <div className="metric-list-row" key={`${row.label}-${row.value}`}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewStars({ rating }: { rating: number }) {
  return <div className="review-stars">{Array.from({ length: 5 }, (_, i) => (i < rating ? "★" : "☆")).join("")}</div>;
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
