'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import TramiteTimeline from '@/components/tramites/TramiteTimeline';
import { ArrowLeft, Download } from 'lucide-react';

export default function DetalleTramitePage() {
  const router = useRouter();
  const params = useParams();
  const [tramite, setTramite] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params?.id) {
      cargarDetalles(params.id);
    }
  }, [params]);

  async function cargarDetalles(id) {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Cargar resumen del trámite
      const summaryResponse = await fetch(`/api/applications/${id}/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!summaryResponse.ok) {
        throw new Error('Error al cargar detalles del trámite');
      }

      const summaryData = await summaryResponse.json();
      console.log('Datos del summary:', summaryData);

      // Cargar historial del trámite
      const historyResponse = await fetch(`/api/applications/${id}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let historyData = [];
      if (historyResponse.ok) {
        historyData = await historyResponse.json();
        console.log('Datos del historial:', historyData);
      }

      // Transformar datos del trámite - Manejo flexible de diferentes estructuras
      const tramiteTransformado = {
        id: summaryData.applicationId || summaryData.id || id,
        numero: summaryData.applicationNumber || `TRM-${summaryData.applicationId || id}`,
        tipo: summaryData.procedureName || summaryData.procedure?.name || 'Trámite',
        descripcion: summaryData.procedure?.description || summaryData.description || 'Sin descripción',
        estado: translateStatus(summaryData.status),
        categoria: summaryData.procedure?.category || 'General',
        fechaSolicitud: formatDate(summaryData.createAt || summaryData.createdAt || summaryData.applicationDate),
        fechaActualizacion: formatDate(summaryData.updateAt || summaryData.updatedAt),
        // Información adicional del usuario si viene
        userName: summaryData.userName || summaryData.user?.name,
        userEmail: summaryData.userEmail || summaryData.user?.email,
        // Costo si viene
        costo: summaryData.cost || summaryData.procedure?.cost,
        // Información de pago si existe
        payment: summaryData.payment,
        // Archivos si vienen
        files: summaryData.files || [],
        // Formulario si viene
        formData: summaryData.formData || summaryData.form,
        informacionAdicional: summaryData.notes || summaryData.additionalInfo || getStatusMessage(summaryData.status),
        _original: summaryData
      };

      setTramite(tramiteTransformado);

      // Transformar historial
      const historialTransformado = Array.isArray(historyData) ? historyData.map(item => ({
        estado: translateStatus(item.status) || item.estado || 'Actualización',
        fecha: formatDateLong(item.changeDate || item.timestamp || item.createdAt || item.fecha),
        descripcion: item.description || item.notes || getHistoryDescription(item.status),
        isActive: true
      })) : [];

      // Si no hay historial de la API, crear uno básico con los datos del summary
      if (historialTransformado.length === 0) {
        historialTransformado.push({
          estado: tramiteTransformado.estado,
          fecha: formatDateLong(summaryData.createAt || summaryData.createdAt),
          descripcion: getHistoryDescription(summaryData.status),
          isActive: true
        });
      }

      setHistorial(historialTransformado);

    } catch (err) {
      console.error('Error al cargar detalles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function translateStatus(status) {
    const statusMap = {
      'BORRADOR': 'Pendiente',
      'ENVIADO': 'En proceso',
      'PAGADO': 'En proceso',
      'EN_REVISION': 'En proceso',
      'OBSERVADO': 'Pendiente',
      'APROBADO': 'Completado',
      'RECHAZADO': 'Rechazado'
    };
    return statusMap[status] || 'Pendiente';
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }

  function formatDateLong(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }

  function getStatusMessage(status) {
    const messages = {
      'BORRADOR': 'Tu solicitud está en borrador y aún no ha sido enviada.',
      'ENVIADO': 'Tu solicitud ha sido enviada y está siendo revisada.',
      'PAGADO': 'El pago ha sido procesado correctamente.',
      'EN_REVISION': 'Tu trámite está siendo procesado por la dependencia correspondiente.',
      'OBSERVADO': 'Tu solicitud tiene observaciones que deben ser atendidas.',
      'APROBADO': 'Trámite aprobado exitosamente. Documento disponible para entregar.',
      'RECHAZADO': 'Tu solicitud ha sido rechazada.'
    };
    return messages[status] || 'Estado del trámite.';
  }

  function getHistoryDescription(status) {
    const descriptions = {
      'BORRADOR': 'Tu solicitud fue creada en el sistema',
      'ENVIADO': 'Tu solicitud fue registrada en el sistema',
      'PAGADO': 'El pago fue procesado correctamente',
      'EN_REVISION': 'Tu trámite está siendo procesado por la dependencia correspondiente',
      'OBSERVADO': 'Se han detectado observaciones en tu solicitud',
      'APROBADO': 'Tu solicitud ha sido procesada exitosamente',
      'RECHAZADO': 'Tu solicitud no pudo ser aprobada'
    };
    return descriptions[status] || 'Actualización del estado del trámite';
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
