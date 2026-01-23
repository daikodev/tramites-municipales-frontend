import { ClipboardList, CheckCircle, Clock, XCircle } from "lucide-react";

export default function StatsPanel({ stats }) {
  const items = [
    {
      label: "Total de trámites",
      value: stats.total,
      icon: ClipboardList,
    },
    {
      label: "Completados",
      value: stats.completados,
      icon: CheckCircle,
    },
    {
      label: "En proceso",
      value: stats.enProceso,
      icon: Clock,
    },
    {
      label: "Rechazados",
      value: stats.rechazados,
      icon: XCircle,
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-[8px] bg-[#e1e1e1] border border-black/10 shadow-[0_4px_10px_rgba(0,0,0,0.15)] px-5 py-4"
        >
          <p className="text-[12px] text-black/50">{label}</p>
          <p className="mt-1 text-[22px] font-semibold text-black">{value}</p>
        </div>
      ))}
    </section>
  );
}
