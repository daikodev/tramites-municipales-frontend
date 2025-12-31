export default function TramiteTimeline({ historial }) {
  return (
    <div className="space-y-6">
      {historial.map((item, index) => {
        const isLast = index === historial.length - 1;

        return (
          <div key={index} className="flex items-start gap-4">
            <div className="relative flex flex-col items-center">
              <span
                className={`h-3 w-3 rounded-full ${
                  item.isActive ? 'bg-[#0b3a77]' : 'bg-black/15'
                }`}
              />
              {!isLast && (
                <span className="mt-2 w-[2px] flex-1 min-h-[38px] bg-black/10" />
              )}
            </div>

            <div className="pt-[-2px]">
              <h3 className="text-[13px] font-semibold text-black">
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
