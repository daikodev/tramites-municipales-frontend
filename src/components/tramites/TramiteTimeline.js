export default function TramiteTimeline({ historial }) {
  if (!historial || historial.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-black/40">No hay historial disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {historial.map((item, index) => {
        const isLast = index === historial.length - 1;

        return (
          <div key={index} className="flex items-start gap-4">
            <div className="relative flex flex-col items-center">
              <span
                className={`h-3 w-3 rounded-full border-2 ${
                  item.isActive
                    ? "bg-[#0b3a77] border-[#0b3a77] shadow-md"
                    : "bg-white border-black/20"
                }`}
              />
              {!isLast && (
                <span className="mt-2 w-[2px] flex-1 min-h-[38px] bg-black/10" />
              )}
            </div>

            <div
              className={`pt-[-2px] ${item.isActive ? "opacity-100" : "opacity-70"}`}
            >
              <h3
                className={`text-[13px] font-semibold ${item.isActive ? "text-[#0b3a77]" : "text-black"}`}
              >
                {item.estado}
              </h3>
              <p className="text-[11px] text-black/40 mt-0.5">{item.fecha}</p>
              <p className="text-[12px] text-black/55 mt-1">
                {item.descripcion}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
