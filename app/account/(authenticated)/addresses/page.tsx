export default function AddressesPage() {
  const addrs = [
    {
      label: "Home",
      line1: "14 Adeniyi Jones Avenue",
      line2: "Ikeja, Lagos State",
      isDefault: true,
    },
    {
      label: "Work",
      line1: "Eko Atlantic City",
      line2: "Victoria Island, Lagos",
      isDefault: false,
    },
  ];
  return (
    <div className="space-y-4">
      {addrs.map((a) => (
        <div
          key={a.label}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-100 bg-white p-6 shadow-sm"
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-medium text-stone-900">{a.label}</span>
              {a.isDefault && (
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-500">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-stone-400">{a.line1}</p>
            <p className="text-sm text-stone-400">{a.line2}</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-400">
              Edit
            </button>
            {!a.isDefault && (
              <button className="rounded-lg px-4 py-2 text-sm text-stone-400 hover:text-red-500">
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
      <button className="mt-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700">
        + Add New Address
      </button>
    </div>
  );
}
