'use client';
import { useEffect, useState } from 'react';

const ESTADOS = [
  { value: 'PAGADO', label: 'Pagado', color: 'bg-blue-100 text-blue-800' },
  { value: 'EN_REVISION', label: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'OBSERVADO', label: 'Observado', color: 'bg-orange-100 text-orange-800' },
  { value: 'APROBADO', label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  { value: 'RECHAZADO', label: 'Rechazado', color: 'bg-red-100 text-red-800' }
];

export default function AdminDashboard() {
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pendientes: 0, aprobados: 0, rechazados: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    cargarTramites();
  }, []);

  const cargarTramites = async () => {
    try {
      setError("");
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data?.message || 'No se pudo obtener los trámites');
        setTramites([]);
        setStats({ pendientes: 0, aprobados: 0, rechazados: 0 });
        return;
      }
      
      const list = Array.isArray(data)
        ? data
        : (data?.data ?? data?.content ?? data?.applications ?? data?.items ?? data?.results ?? []);
      setTramites(list);
      const aprobados = list.filter((t) => t.status === 'APROBADO').length;
      const rechazados = list.filter((t) => t.status === 'RECHAZADO').length;
      const pendientes = list.length - aprobados - rechazados;
      setStats({ pendientes, aprobados, rechazados });
    } catch (error) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (tramiteId, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/applications/${tramiteId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nuevoEstado })
      });

      if (response.ok) {
        cargarTramites();
      } else {
        setError('Error al actualizar el estado');
      }
    } catch (error) {
      setError('Error al actualizar el estado');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando trámites...</div>;
  }

  return (
    <div>
      <div className="mx-auto max-w-[1120px] px-8 pt-2 pb-4">
        <h1 className="text-[28px] font-bold text-black mb-8">
          Bienvenido, Administrador
        </h1>

      </div>

      <div className="mx-auto max-w-[1120px] px-8 pt-1 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="bg-white rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-black/10 p-6">
            <p className="text-sm text-black/60">Trámites pendientes</p>
            <p className="text-[34px] font-bold text-[#0b63c7] mt-2">{stats.pendientes}</p>
          </div>
          <div className="bg-white rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-black/10 p-6">
            <p className="text-sm text-black/60">Trámites aprobados</p>
            <p className="text-[34px] font-bold text-green-600 mt-2">{stats.aprobados}</p>
          </div>
          <div className="bg-white rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-black/10 p-6">
            <p className="text-sm text-black/60">Trámites rechazados</p>
            <p className="text-[34px] font-bold text-red-600 mt-2">{stats.rechazados}</p>
          </div>
        </div>

      <div className="bg-white rounded-xl shadow-[0_8px_18px_rgba(0,0,0,0.16)] border border-black/10 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciudadano</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Trámite</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado Actual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cambiar Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(Array.isArray(tramites) ? tramites : []).map((tramite) => (
              <tr key={tramite.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tramite.userName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tramite.procedureName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tramite.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    ESTADOS.find(e => e.value === tramite.status)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {ESTADOS.find(e => e.value === tramite.status)?.label || tramite.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={tramite.status}
                    onChange={(e) => cambiarEstado(tramite.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {ESTADOS.map(estado => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    onClick={() => window.location.href = `/admin/tramites/${tramite.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
            {(!error && Array.isArray(tramites) && tramites.length === 0) && (
              <tr>
                <td className="px-6 py-6 text-sm text-gray-500" colSpan={6}>
                  No hay trámites registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}