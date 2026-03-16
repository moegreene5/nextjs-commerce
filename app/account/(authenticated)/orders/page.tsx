export default function OrdersPage() {
  const orders = [
    {
      id: "#ORD-8821",
      date: "Feb 24, 2026",
      items: "2 items",
      total: "₦84,500",
      status: "Delivered",
    },
    {
      id: "#ORD-8790",
      date: "Feb 10, 2026",
      items: "1 item",
      total: "₦32,000",
      status: "In Transit",
    },
    {
      id: "#ORD-8741",
      date: "Jan 28, 2026",
      items: "3 items",
      total: "₦121,750",
      status: "Delivered",
    },
  ];
  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div
          key={o.id}
          className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-stone-100 bg-stone-50 text-2xl">
              🛍
            </div>
            <div className="flex-1">
              <p className="font-medium text-stone-900">{o.id}</p>
              <p className="text-sm text-stone-400">
                {o.date} · {o.items}
              </p>
            </div>
            <div className="text-right">
              <p className="mb-1.5 font-medium text-stone-900">{o.total}</p>
              <span
                className={`rounded-full px-3 py-0.5 text-[11px] font-medium ${
                  o.status === "Delivered"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {o.status}
              </span>
            </div>
          </div>
          <div className="my-5 h-px bg-stone-100" />
          <div className="flex gap-2">
            <button className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400">
              Track Order
            </button>
            <button className="rounded-lg px-4 py-2 text-sm text-stone-500 transition-colors hover:text-stone-900">
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
