import {
  CheckCircle,
  Clock,
  PauseCircle,
  Calendar,
  RefreshCcw,
  Folder
} from 'lucide-react';

export default function TramiteHistorialCard({ tramite }) {
  const estadoConfig = {
    Completado: {
      icon: CheckCircle,
      badge: 'text-green-600 bg-green-100'
    },
    'En proceso': {
      icon: Clock,
      badge: 'text-blue-600 bg-blue-100'
    },
    Pendiente: {
      icon: PauseCircle,
      badge: 'text-orange-600 bg-orange-100'
    },
    Borrador: {
      icon: PauseCircle,
      badge: 'text-gray-600 bg-gray-100'
    },
    Rechazado: {
      icon: PauseCircle,
      badge: 'text-red-600 bg-red-100'
    },
    Cancelado: {
      icon: PauseCircle,
      badge: 'text-red-600 bg-red-100'
    },
    Rechazado: {
      icon: PauseCircle,
      badge: 'text-red-600 bg-red-100'
    },
    Cancelado: {
      icon: PauseCircle,
      badge: 'text-gray-600 bg-gray-100'
    }
  };

  const estado = tramite?.estado || 'Pendiente';
  const EstadoIcon = estadoConfig[estado]?.icon || PauseCircle;

  return (
    <article className="rounded-[10px] bg-[#e1e1e1] border border-black/10 shadow-[0_6px_14px_rgba(0,0,0,0.18)] px-6 py-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <EstadoIcon className="h-6 w-6 text-green-600" />

          <div>
            <h3 className="text-[15px] font-semibold text-black">
              {tramite?.tipo || 'Trámite'}
            </h3>
            <p className="text-[12px] text-black/50">
              Número: {tramite?.numero || 'N/A'}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-[11px] font-semibold ${estadoConfig[estado]?.badge}`}
        >
          {estado}
        </span>
      </div>

      <p className="mt-3 text-[13px] text-black/60">
        {tramite?.descripcion || 'Sin descripción'}
      </p>

      <div className="mt-4 flex flex-wrap gap-6 text-[12px] text-black/50">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Solicitado: {tramite?.fechaSolicitud || 'N/A'}
        </div>

        <div className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          Actualizado: {tramite?.fechaActualizacion || 'N/A'}
        </div>

        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          {tramite?.categoria || 'General'}
        </div>
      </div>
    </article>
  );
}
