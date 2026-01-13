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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completados: 0,
    enProceso: 0,
    pendientes: 0
  });

  useEffect(() => {
    cargarHistorial();
  }, []);

  async function cargarHistorial() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/applications/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTramites(data);
        
        // Calcular estadísticas
        const total = data.length;
        const completados = data.filter(t => t.status === 'COMPLETED' || t.estado === 'Completado').length;
        const enProceso = data.filter(t => t.status === 'IN_PROGRESS' || t.estado === 'En proceso').length;
        const pendientes = data.filter(t => t.status === 'PENDING' || t.estado === 'Pendiente').length;
        
        setStats({ total, completados, enProceso, pendientes });
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
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
          <h2 className='text-[16px] font-semibold text-black mb-4'>
            Historial de trámites
            </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-black/50">Cargando historial...</p>
            </div>
          ) : tramites.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-black/50">No tienes trámites registrados</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {tramites.map((tramite) => (
                <TramiteHistorialCard
                  key={tramite.id}
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