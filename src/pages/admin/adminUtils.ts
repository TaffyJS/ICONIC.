import type { Order, OrderStatus } from "../../data";

export function getAdminStats(orders: Order[]) {
  const byStatus = orders.reduce(
    (acc, order) => {
      acc[order.status] += 1;
      return acc;
    },
    {
      pending: 0,
      received: 0,
      traveling: 0,
      ready: 0,
      completed: 0,
    } as Record<OrderStatus, number>,
  );

  return orders.reduce(
    (acc, order) => {
      acc.totalOrders += 1;
      acc.revenue += order.total;
      acc.items += order.items.reduce((sum, item) => sum + item.quantity, 0);
      if (order.channel === "address") acc.channelAddress += 1;
      if (order.channel === "office") acc.channelOffice += 1;
      if (order.payment === "card") acc.paymentCard += 1;
      if (order.payment === "cash") acc.paymentCash += 1;
      acc.byStatus = byStatus;
      return acc;
    },
    {
      totalOrders: 0,
      revenue: 0,
      items: 0,
      channelAddress: 0,
      channelOffice: 0,
      paymentCard: 0,
      paymentCash: 0,
      byStatus,
    },
  );
}
