'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/dashboard/Header';
import StatsPanel from '@/components/dashboard/StatsPanel';
import TramiteHistorialCard from '@/components/dashboard/TramiteHistorialCard';
import { FileText, Search, ChevronLeft, ChevronRight, Home } from 'lucide-react';

export default function HistorialPage() {
  const router = useRouter();
  const [tramites, setTramites] = useState([]);
  const [tramitesFiltrados, setTramitesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [stats, setStats] = useState({
    total: 0,
    completados: 0,
    enProceso: 0,
    pendientes: 0
  });

  // Estados para filtros y paginación
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  useEffect(() => {
    cargarHistorial();
  }, []);

  useEffect(() => {
    // Aplicar filtro cuando cambia el estado seleccionado
    if (filtroEstado === 'todos') {
      setTramitesFiltrados(tramites);
    } else {
      setTramitesFiltrados(tramites.filter(t => t.estado === filtroEstado));
    }
  }, [filtroEstado, tramites]);

  async function cargarHistorial() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token) {
        console.error('No hay token disponible');
        router.push('/auth/login');
        return;
      }
      
      console.log('🔍 Cargando trámites del usuario:', userId);
      
      const response = await fetch('/api/applications/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Trámites recibidos del backend:', data.length, 'trámites');
        console.log('📊 Estructura de primer trámite:', data[0]);
        console.log('📋 Campos disponibles:', data[0] ? Object.keys(data[0]) : 'Sin datos');
        
        // Mapear datos del backend al formato esperado por el frontend
        const tramitesMapeados = data.map(t => {
          console.log('🔍 Procesando trámite:', t);
          
          // Usar los nombres exactos que devuelve el backend
          const id = t.applicationId || t.id || t.id_solicitud;
          const procedureName = t.procedureName || 'Trámite Municipal';
          const status = t.status || 'DESCONOCIDO';
          const createdAt = t.createdAt;
          const updatedAt = t.updatedAt;
          
          return {
            id,
            numero: `TR-${String(id).padStart(6, '0')}`,
            tipo: procedureName,
            descripcion: 'Trámite en proceso',
            estado: mapearEstado(status),
            fechaSolicitud: formatearFecha(createdAt),
            fechaActualizacion: formatearFecha(updatedAt),
            fechaSolicitudTimestamp: createdAt ? new Date(createdAt).getTime() : 0,
            categoria: 'Trámites Municipales',
            status: status,
            ...t
          };
        });
        
        // Ordenar por fecha más reciente primero
        tramitesMapeados.sort((a, b) => b.fechaSolicitudTimestamp - a.fechaSolicitudTimestamp);
        
        console.log('📋 Trámites procesados y ordenados:', tramitesMapeados.length);
        
        setTramites(tramitesMapeados);
        
        // Calcular estadísticas basadas en el status del backend
        const total = tramitesMapeados.length;
        const completados = tramitesMapeados.filter(t => {
          const status = (t.status || '').toString().toUpperCase();
          return ['COMPLETED', 'COMPLETADO', 'PAID', 'PAGADO'].includes(status);
        }).length;
        const enProceso = tramitesMapeados.filter(t => {
          const status = (t.status || '').toString().toUpperCase();
          return ['IN_PROGRESS', 'EN_PROCESO', 'SUBMITTED', 'ENVIADO'].includes(status);
        }).length;
        const pendientes = tramitesMapeados.filter(t => {
          const status = (t.status || '').toString().toUpperCase();
          return ['PENDING', 'PENDIENTE', 'DRAFT', 'BORRADOR'].includes(status);
        }).length;
        
        console.log('📊 Estadísticas:', { total, completados, enProceso, pendientes });
        
        setStats({ total, completados, enProceso, pendientes });
      } else {
        console.error('Error en respuesta:', response.status);
        if (response.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem('token');
          router.push('/auth/login');
        }
      }

      const data = await response.json();
      console.log('Trámites recibidos:', data);
      
      setTramites(Array.isArray(data) ? data : []);
      
      // Calcular estadísticas
      const tramitesArray = Array.isArray(data) ? data : [];
      const total = tramitesArray.length;
      const completados = tramitesArray.filter(t => t.estado === 'Completado').length;
      const enProceso = tramitesArray.filter(t => t.estado === 'En proceso').length;
      const pendientes = tramitesArray.filter(t => t.estado === 'Pendiente').length;
      
      setStats({ total, completados, enProceso, pendientes });
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setTramites([]);
    } finally {
      setLoading(false);
    }
  }
  
  // Función auxiliar para mapear estados del backend a español
  function mapearEstado(status) {
    if (!status) return 'Desconocido';
    
    // Normalizar el estado a mayúsculas para comparación
    const statusUpper = status.toString().toUpperCase();
    
    const estados = {
      'DRAFT': 'Borrador',
      'BORRADOR': 'Borrador',
      'PENDING': 'Pendiente',
      'PENDIENTE': 'Pendiente',
      'SUBMITTED': 'En proceso',
      'ENVIADO': 'En proceso',
      'IN_PROGRESS': 'En proceso',
      'EN_PROCESO': 'En proceso',
      'PAID': 'Completado',
      'PAGADO': 'Completado',
      'COMPLETED': 'Completado',
      'COMPLETADO': 'Completado',
      'REJECTED': 'Rechazado',
      'RECHAZADO': 'Rechazado',
      'CANCELLED': 'Cancelado',
      'CANCELADO': 'Cancelado'
    };
    return estados[statusUpper] || status;
  }
  
  // Función auxiliar para formatear fechas
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

  // Filtrar y buscar trámites
  const tramitesFiltrados = useMemo(() => {
    let resultado = [...tramites];

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(t => {
        const status = (t.status || '').toString().toUpperCase();
        
        if (filtroEstado === 'completados') {
          return ['COMPLETED', 'COMPLETADO', 'PAID', 'PAGADO'].includes(status);
        } else if (filtroEstado === 'en-proceso') {
          return ['IN_PROGRESS', 'EN_PROCESO', 'SUBMITTED', 'ENVIADO'].includes(status);
        } else if (filtroEstado === 'pendientes') {
          return ['PENDING', 'PENDIENTE', 'DRAFT', 'BORRADOR'].includes(status);
        }
        return true;
      });
    }

    // Buscar por texto
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(t =>
        t.numero.toLowerCase().includes(termino) ||
        t.tipo.toLowerCase().includes(termino) ||
        t.descripcion.toLowerCase().includes(termino)
      );
    }

    return resultado;
  }, [tramites, filtroEstado, busqueda]);

  // Calcular paginación
  const totalPaginas = Math.ceil(tramitesFiltrados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const tramitesPaginados = tramitesFiltrados.slice(indiceInicio, indiceFin);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, busqueda]);

  return (
    <main className="min-h-screen bg-[#d9d9d9]">
      <Header />
      
      <section className='mx-auto max-w-[1120px] px-6 py-8'>
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <h1 className='flex items-center gap-3 text-[30px] font-semibold text-black'>
              <FileText className='h-7 w-7'/>
              Mis Trámites Municipales
            </h1>
            <button
              onClick={() => router.push('/dasboard')}
              className='h-[36px] px-4 rounded-[6px] bg-[#0b3a77] text-white text-[13px] font-semibold flex items-center gap-2 hover:brightness-95 transition shadow-md'
            >
              <Home className='h-4 w-4' />
              Volver al Inicio
            </button>
          </div>
          <p className='text-[14px] text-black/45 mt-2'>
            Consulta el estado y descarga comprobantes de tus trámites
          </p>
        </div>

      <StatsPanel stats={stats} />

      <section className='mt-8'>
        {/* Título */}
        <h2 className='text-[16px] font-semibold text-black mb-4'>
          Historial de trámites
        </h2>

        {/* Barra de búsqueda y filtros en la misma línea */}
        <div className='mb-6 space-y-4'>
          {/* Barra de búsqueda */}
          <div className='relative w-full'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40' />
            <input
              type='text'
              placeholder='Buscar por número o tipo de trámite...'
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className='w-full h-[36px] pl-10 pr-4 rounded-[6px] border border-black/20 bg-white text-[13px] text-black placeholder:text-black/40 focus:outline-none focus:border-[#0b3a77]'
            />
          </div>

          {/* Filtros por estado */}
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-4 py-2 rounded-[6px] text-[12px] font-medium transition ${
                filtroEstado === 'todos'
                  ? 'bg-[#0b3a77] text-white shadow-md'
                  : 'bg-white text-black/70 border border-black/20 hover:bg-black/5'
              }`}
            >
              Todos ({tramites.length})
            </button>
            <button
              onClick={() => setFiltroEstado('completados')}
              className={`px-4 py-2 rounded-[6px] text-[12px] font-medium transition ${
                filtroEstado === 'completados'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-black/70 border border-black/20 hover:bg-black/5'
              }`}
            >
              Completados ({stats.completados})
            </button>
            <button
              onClick={() => setFiltroEstado('en-proceso')}
              className={`px-4 py-2 rounded-[6px] text-[12px] font-medium transition ${
                filtroEstado === 'en-proceso'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-black/70 border border-black/20 hover:bg-black/5'
              }`}
            >
              En proceso ({stats.enProceso})
            </button>
            <button
              onClick={() => setFiltroEstado('pendientes')}
              className={`px-4 py-2 rounded-[6px] text-[12px] font-medium transition ${
                filtroEstado === 'pendientes'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white text-black/70 border border-black/20 hover:bg-black/5'
              }`}
            >
              Pendientes ({stats.pendientes})
            </button>
          </div>
        </div>
          
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-black/50">Cargando historial...</p>
          </div>
        ) : tramitesFiltrados.length === 0 ? (
          <div className="text-center py-8 rounded-[10px] bg-white border border-black/10 shadow-sm">
            <p className="text-sm text-black/50">
              {busqueda || filtroEstado !== 'todos' 
                ? 'No se encontraron trámites con los filtros aplicados'
                : 'No tienes trámites registrados'}
            </p>
          </div>
        ) : (
          <>
            {/* Lista de trámites paginados */}
            <div className='space-y-4'>
              {tramitesPaginados.map((tramite) => (
                <TramiteHistorialCard
                  key={tramite.id || `tramite-${index}`}
                  tramite={tramite}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className='mt-6 flex items-center justify-between'>
                <p className='text-[13px] text-black/50'>
                  Mostrando {indiceInicio + 1}-{Math.min(indiceFin, tramitesFiltrados.length)} de {tramitesFiltrados.length} trámites
                </p>
                
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                    disabled={paginaActual === 1}
                    className='h-[32px] w-[32px] rounded-[6px] flex items-center justify-center border border-black/20 bg-white text-black/70 hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition'
                    aria-label='Página anterior'
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </button>
                  
                  {/* Números de página */}
                  <div className='flex gap-1'>
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                      <button
                        key={pagina}
                        onClick={() => setPaginaActual(pagina)}
                        className={`h-[32px] min-w-[32px] px-2 rounded-[6px] text-[13px] font-medium transition ${
                          paginaActual === pagina
                            ? 'bg-[#0b3a77] text-white shadow-md'
                            : 'bg-white text-black/70 border border-black/20 hover:bg-black/5'
                        }`}
                      >
                        {pagina}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                    disabled={paginaActual === totalPaginas}
                    className='h-[32px] w-[32px] rounded-[6px] flex items-center justify-center border border-black/20 bg-white text-black/70 hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition'
                    aria-label='Página siguiente'
                  >
                    <ChevronRight className='h-4 w-4' />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
      </section>
    </main>
  );
}