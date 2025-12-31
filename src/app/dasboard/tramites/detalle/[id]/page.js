'use client';

import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import TramiteTimeline from '@/components/tramites/TramiteTimeline';
import { ArrowLeft, Download } from 'lucide-react';

export default function DetalleTramitePage() {
  const router = useRouter();
  const { id } = useParams();

  const tramite = {
    id,
    numero: 'TRM-2025-001542',
    tipo: 'Licencia de funcionamiento',
    descripcion: 'Solicitud de licencia de funcionamiento para local comercial',
    estado: 'Completado',
    categoria: 'Licencias y Permisos',
    fechaSolicitud: '14/02/2025',
    fechaActualizacion: '27/02/2025',
    informacionAdicional:
      'Trámite aprobado exitosamente. Documento disponible para entregar.',
  };

  const historial = [
    {
      estado: 'Trámite solicitado',
      fecha: '14 de enero de 2025',
      descripcion: 'Tu solicitud fue registrada en el sistema',
      isActive: true,
    },
    {
      estado: 'En revisión',
      fecha: '27 de enero de 2025',
      descripcion:
        'Tu trámite está siendo procesado por la dependencia correspondiente',
      isActive: false,
    },
    {
      estado: 'Trámite completado',
      fecha: '27 de enero de 2025',
      descripcion: 'Tu solicitud ha sido procesada exitosamente',
      isActive: true,
    },
  ];

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Completado':
        return 'text-green-600 bg-green-100';
      case 'En proceso':
        return 'text-orange-600 bg-orange-100';
      case 'Pendiente':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-black/60 bg-black/10';
    }
  };

  const handleDescargar = () => {
    console.log('Descargar comprobante');
  };

  return (
    <main className="min-h-screen bg-[#d9d9d9]">
      <Header />

      <section className="mx-auto max-w-[1120px] px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center h-10 w-10 rounded-[10px] text-black/80 hover:bg-black/5 transition"
              aria-label="Atrás"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <h1 className="text-[34px] font-semibold text-black">
              Detalles del trámite
            </h1>
          </div>

          <p className="ml-[52px] mt-1 text-[13px] text-black/45">
            Referencia: {tramite.numero}
          </p>
        </div>

        <section className="rounded-[10px] bg-[#e1e1e1] border border-black/10 shadow-[0_10px_18px_rgba(0,0,0,0.20)] px-8 py-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[16px] font-semibold text-black">
                {tramite.tipo}
              </h2>
              <p className="mt-1 text-[12px] text-black/45">
                {tramite.descripcion}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getEstadoColor(
                tramite.estado
              )}`}
            >
              {tramite.estado}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            <div>
              <p className="text-[11px] text-black/40">Número de trámite</p>
              <p className="text-[14px] font-semibold text-black">
                {tramite.numero}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-black/40">Tipo</p>
              <p className="text-[14px] font-semibold text-black">
                {tramite.categoria}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-black/40">Fecha de solicitud</p>
              <p className="text-[14px] font-semibold text-black">
                {tramite.fechaSolicitud}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-black/40">Última actualización</p>
              <p className="text-[14px] font-semibold text-black">
                {tramite.fechaActualizacion}
              </p>
            </div>
          </div>

          <div className="my-6 h-[1px] w-full bg-black/10" />

          <div>
            <p className="text-[11px] text-black/40 mb-2">
              Información adicional
            </p>
            <div className="rounded-[8px] border border-black/10 bg-black/5 px-4 py-3 text-[12px] text-black/70">
              {tramite.informacionAdicional}
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleDescargar}
              className="h-[30px] px-4 rounded-[4px] bg-[#0b3a77] text-white text-[12px] font-semibold flex items-center gap-2 hover:brightness-95 transition shadow-[0_3px_0_rgba(0,0,0,0.18)]"
            >
              <Download className="h-4 w-4" />
              Descargar Comprobante
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-[10px] bg-[#e1e1e1] border border-black/10 shadow-[0_10px_18px_rgba(0,0,0,0.18)] px-8 py-6">
          <h2 className="text-[16px] font-semibold text-black mb-4">
            Historial del trámite
          </h2>

          <TramiteTimeline historial={historial} />
        </section>
      </section>
    </main>
  );
}
