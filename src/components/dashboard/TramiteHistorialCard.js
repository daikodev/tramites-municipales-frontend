import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Clock,
  PauseCircle,
  Calendar,
  RefreshCcw,
  Folder,
  Eye,
} from "lucide-react";

export default function TramiteHistorialCard({ tramite }) {
  const router = useRouter();
  const estadoConfig = {
    Completado: {
      icon: CheckCircle,
      badge: "text-green-700 bg-green-100",
    },
    "En Proceso": {
      icon: Clock,
      badge: "text-orange-700 bg-orange-100",
    },
    "En proceso": {
      icon: Clock,
      badge: "text-orange-700 bg-orange-100",
    },
    Observado: {
      icon: Clock,
      badge: "text-orange-700 bg-orange-100",
    },
    Rechazado: {
      icon: PauseCircle,
      badge: "text-red-700 bg-red-100",
    },
  };

  const EstadoIcon = estadoConfig[tramite.estado]?.icon || PauseCircle;

  return (
    <article className="rounded-[10px] bg-[#e1e1e1] border border-black/10 shadow-[0_6px_14px_rgba(0,0,0,0.18)] px-6 py-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <EstadoIcon className="h-6 w-6 text-green-600" />

          <div>
            <h3 className="text-[15px] font-semibold text-black">
              {tramite.tipo}
            </h3>
            <p className="text-[12px] text-black/50">
              Número: {tramite.numero}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-[11px] font-semibold ${estadoConfig[tramite.estado]?.badge}`}
        >
          {tramite.estado}
        </span>
      </div>

      <p className="mt-3 text-[13px] text-black/60">{tramite.descripcion}</p>

      <div className="mt-4 flex flex-wrap gap-6 text-[12px] text-black/50">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Solicitado: {tramite.fechaSolicitud}
        </div>

        <div className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          Actualizado: {tramite.fechaActualizacion}
        </div>

        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          {tramite.categoria}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-black/10">
        <button
          onClick={() =>
            router.push(`/dasboard/tramites/detalle/${tramite.id}`)
          }
          className="h-[32px] px-4 rounded-md bg-[#0b3a77] text-white text-[12px] font-semibold flex items-center gap-2 hover:brightness-95 shadow-md cursor-pointer scale-100 active:scale-95 transition-all ease-in-out"
        >
          <Eye className="h-4 w-4" />
          Ver detalles
        </button>
      </div>
    </article>
  );
}
