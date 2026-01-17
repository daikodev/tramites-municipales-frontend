'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import TramiteTimeline from '@/components/tramites/TramiteTimeline';
import { ArrowLeft, Download } from 'lucide-react';

export default function DetalleTramitePage() {
  const router = useRouter();
  const { id } = useParams();
  const [tramite, setTramite] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      cargarDetalleTramite();
      cargarHistorial();
    }
  }, [id]);

  async function cargarDetalleTramite() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/applications/${id}/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTramite({
          id: data.id,
          numero: `TR-${String(data.id).padStart(6, '0')}`,
          tipo: data.procedureName || 'Trámite Municipal',
          descripcion: data.procedure?.description || 'Trámite en proceso',
          estado: mapearEstado(data.status),
          categoria: 'Trámites Municipales',
          fechaSolicitud: formatearFecha(data.createdAt),
          fechaActualizacion: formatearFecha(data.updatedAt),
          informacionAdicional: obtenerInformacionAdicional(data),
          ...data
        });
      } else if (response.status === 401) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    }
  }

  async function cargarHistorial() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/applications/${id}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const historialMapeado = data.map((item, index) => ({
          estado: mapearEstadoHistorial(item.status),
          fecha: formatearFechaLarga(item.createdAt),
          descripcion: item.description || obtenerDescripcionEstado(item.status),
          isActive: index === data.length - 1 // El último es el actual
        }));
        setHistorial(historialMapeado);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  }

  function mapearEstado(status) {
    const estados = {
      'DRAFT': 'Borrador',
      'PENDING': 'Pendiente',
      'SUBMITTED': 'En proceso',
      'IN_PROGRESS': 'En proceso',
      'PAID': 'Completado',
      'COMPLETED': 'Completado',
      'REJECTED': 'Rechazado',
      'CANCELLED': 'Cancelado'
    };
    return estados[status] || status;
  }

  function mapearEstadoHistorial(status) {
    const estados = {
      'DRAFT': 'Trámite iniciado',
      'PENDING': 'Documentos pendientes',
      'SUBMITTED': 'En revisión',
      'IN_PROGRESS': 'En proceso',
      'PAID': 'Pago procesado',
      'COMPLETED': 'Trámite completado',
      'REJECTED': 'Trámite rechazado',
      'CANCELLED': 'Trámite cancelado'
    };
    return estados[status] || status;
  }

  function obtenerDescripcionEstado(status) {
    const descripciones = {
      'DRAFT': 'Tu solicitud fue creada en el sistema',
      'PENDING': 'Se requieren documentos adicionales',
      'SUBMITTED': 'Tu solicitud fue enviada y está siendo revisada',
      'IN_PROGRESS': 'Tu trámite está siendo procesado',
      'PAID': 'El pago ha sido procesado exitosamente',
      'COMPLETED': 'Tu trámite ha sido completado',
      'REJECTED': 'Tu solicitud fue rechazada',
      'CANCELLED': 'El trámite fue cancelado'
    };
    return descripciones[status] || 'Actualización del trámite';
  }

  function obtenerInformacionAdicional(data) {
    if (data.status === 'COMPLETED' || data.status === 'PAID') {
      return 'Trámite aprobado exitosamente. Documento disponible para recoger.';
    } else if (data.status === 'IN_PROGRESS' || data.status === 'SUBMITTED') {
      return 'Tu trámite está siendo procesado por la dependencia correspondiente.';
    } else if (data.status === 'PENDING') {
      return 'Se requiere completar la documentación para continuar.';
    } else if (data.status === 'REJECTED') {
      return 'Tu solicitud fue rechazada. Contacta con la oficina para más información.';
    }
    return 'Trámite en proceso.';
  }

  function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  function formatearFechaLarga(fecha) {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#d9d9d9]">
        <Header />
        <section className="mx-auto max-w-[1120px] px-6 py-8">
          <div className="text-center py-12">
            <p className="text-black/50">Cargando detalles del trámite...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!tramite) {
    return (
      <main className="min-h-screen bg-[#d9d9d9]">
        <Header />
        <section className="mx-auto max-w-[1120px] px-6 py-8">
          <div className="text-center py-12">
            <p className="text-black/50">No se encontró el trámite</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-blue-600 hover:underline"
            >
              Volver
            </button>
          </div>
        </section>
      </main>
    );
  }

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
    // TODO: Implementar descarga de comprobante cuando el backend lo proporcione
    if (!params?.id) return;
    console.log('Descargar comprobante del trámite:', params.id);
    alert('Función de descarga en desarrollo');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#d9d9d9]">
        <Header />
        <section className="mx-auto max-w-[1120px] px-6 py-8">
          <div className="text-center py-8">
            <p className="text-sm text-black/50">Cargando detalles del trámite...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !tramite) {
    return (
      <main className="min-h-screen bg-[#d9d9d9]">
        <Header />
        <section className="mx-auto max-w-[1120px] px-6 py-8">
          <div className="text-center py-8">
            <p className="text-sm text-red-600">{error || 'No se pudo cargar el trámite'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Volver al historial
            </button>
          </div>
        </section>
      </main>
    );
  }

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
