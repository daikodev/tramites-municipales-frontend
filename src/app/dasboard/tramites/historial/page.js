'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import StatsPanel from '@/components/dashboard/StatsPanel';
import TramiteHistorialCard from '@/components/dashboard/TramiteHistorialCard';
import { FileText } from 'lucide-react';

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
      
      if (!token || !userId) {
        console.error('No hay sesión activa');
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/applications/my?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al cargar historial:', errorData);
        
        if (response.status === 401) {
          localStorage.clear();
          router.push('/auth/login');
          return;
        }
        throw new Error(errorData.message || 'Error al cargar historial');
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

  const handleVerDetalles = (id) => {
    router.push(`/dasboard/tramites/detalle/${id}`);
  };

  return (
    <main className="min-h-screen bg-[#d9d9d9]">
      <Header />
      
      <section className='mx-auto max-w-[1120px] px-6 py-8'>
        <div className='mb-6'>
        <h1 className='flex items-center gap-3 text-[30px] font-semibold text-black'>
          <FileText className='h-7 w-7'/>
          Mis Trámites Municipales
          </h1>
          <p className='text-[14px] text-black/45'>
            Consulta el estado y descarga comprobantes de tus trámites
          </p>
      </div>

      <StatsPanel stats={stats} />

      <section className='mt-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-[16px] font-semibold text-black'>
              Historial de trámites
            </h2>
            
            <div className='flex items-center gap-2'>
              <span className='text-[12px] text-black/50'>Filtrar por:</span>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className='h-[32px] px-3 rounded-[4px] border border-black/20 bg-white text-[12px] text-black'
              >
                <option value="todos">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En proceso</option>
                <option value="Completado">Completado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-black/50">Cargando historial...</p>
            </div>
          ) : tramitesFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-black/50">
                {tramites.length === 0 
                  ? 'No tienes trámites registrados' 
                  : `No hay trámites con estado "${filtroEstado}"`
                }
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {tramitesFiltrados.map((tramite, index) => (
                <TramiteHistorialCard
                  key={tramite.id || `tramite-${index}`}
                  tramite={tramite}
                  onVerDetalles={handleVerDetalles}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}