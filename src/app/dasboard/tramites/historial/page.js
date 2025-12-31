'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import StatsPanel from '@/components/dashboard/StatsPanel';
import TramiteHistorialCard from '@/components/dashboard/TramiteHistorialCard';
import { FileText } from 'lucide-react';

export default function HistorialPage() {
  const router = useRouter();

  // Datos mock para demostración
  const tramites = [
    {
      id: 1,
      numero: 'TRM-2025-001542',
      tipo: 'Licencia de Funcionamiento',
      descripcion: 'Solicitud de licencia de funcionamiento para local comercial',
      fechaSolicitud: '14 de enero de 2025',
      fechaActualizacion: '27 de enero de 2025',
      estado: 'Completado',
      categoria: 'Licencias y Permisos'
    },
    {
      id: 2,
      numero: 'TRM-2025-001541',
      tipo: 'Certificado de domicilio',
      descripcion: 'Certificado de domicilio para trámites legales',
      fechaSolicitud: '21 de enero de 2025',
      fechaActualizacion: '25 de enero de 2025',
      estado: 'En proceso',
      categoria: 'Registros y Documentos'
    }
  ];

  const stats = {
    total: 2,
    completados: 1,
    enProceso: 1,
    pendientes: 1
  };

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
          
          <div className='space-y-4'>
            {tramites.map((tramite) => (
              <TramiteHistorialCard
                key={tramite.id}
                tramite={tramite}
                onVerDetalles={handleVerDetalles}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}