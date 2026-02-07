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
  const [activeTab, setActiveTab] = useState('PAGADO');
  const [currentPage, setCurrentPage] = useState({});
  const [searchCode, setSearchCode] = useState('');
  const ITEMS_PER_PAGE = 6;

  const getPaginationKey = () => `${activeTab}`;

  const currentPageNum = currentPage[getPaginationKey()] || 1;

  const normalizedSearch = searchCode.trim().toLowerCase();
  const filteredTramites = (Array.isArray(tramites) ? tramites : [])
    .filter((tramite) => tramite.status === activeTab)
    .filter((tramite) => {
      if (!normalizedSearch) return true;
      const code = (tramite.code || '').toString().toLowerCase();
      const citizen = (tramite.userName || '').toString().toLowerCase();
      return code.includes(normalizedSearch) || citizen.includes(normalizedSearch);
    });

  const totalPages = Math.ceil(filteredTramites.length / ITEMS_PER_PAGE);
  const startIndex = (currentPageNum - 1) * ITEMS_PER_PAGE;
  const paginatedTramites = filteredTramites.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (pageNum) => {
    setCurrentPage({
      ...currentPage,
      [getPaginationKey()]: pageNum
    });
  };

  const TABS = [
    { key: 'PAGADO', label: 'Todos' },
    { key: 'EN_REVISION', label: 'En Revisión' },
    { key: 'OBSERVADO', label: 'Observados' },
    { key: 'APROBADO', label: 'Aprobados' },
    { key: 'RECHAZADO', label: 'Rechazados' }
  ];

  useEffect(() => {
    cargarTramites();
  }, []);

  const cargarTramites = async () => {
    try {
      setError("");
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/applications/all', {
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
      const pendientes = list.filter((t) => t.status === 'PAGADO').length;
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
      
      // Mapear el estado al endpoint correcto
      const endpointMap = {
        'EN_REVISION': 'review',
        'OBSERVADO': 'observe',
        'APROBADO': 'approve',
        'RECHAZADO': 'reject'
      };
      
      const endpoint = endpointMap[nuevoEstado];
      if (!endpoint) {
        alert('Estado no válido');
        return;
      }
      
      const response = await fetch(`/api/applications/${tramiteId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        cargarTramites();
      } else {
        alert(`Error: ${data?.message || 'No se pudo actualizar el estado'}`);
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando trámites...</div>;
  }

  return (
    <div>
    {/* HEADER */}
    <div className="mx-auto max-w-[2200px] px-4 pt-1 pb-3">
      <h1 className="text-[30px] font-bold text-black mb-1">
        Bienvenido, Administrador
      </h1>
    </div>

    {/* BLOQUE 1: CARDS + TABS (ancho “normal”) */}
    <div className="mx-auto max-w-[1800px] px-4 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="bg-white rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-black/10 p-6">
          <p className="text-sm text-black/60">Trámites pendientes</p>
          <p className="text-[34px] font-bold text-[#0b63c7] mt-2">
            {tramites.length ? stats.pendientes : '-'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-black/10 p-6">
          <p className="text-sm text-black/60">Trámites aprobados</p>
          <p className="text-[34px] font-bold text-green-600 mt-2">
            {tramites.length ? stats.aprobados : '-'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-black/10 p-6">
          <p className="text-sm text-black/60">Trámites rechazados</p>
          <p className="text-[34px] font-bold text-red-600 mt-2">
            {tramites.length ? stats.rechazados : '-'}
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap justify-center gap-3">
        {TABS.map((tab) => {
          const count = tramites.filter((t) => t.status === tab.key).length;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage({ ...currentPage, [tab.key]: currentPage[tab.key] || 1 });
              }}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-700 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
        </div>
        <div className="flex items-center justify-center sm:justify-end">
          <div className="w-full sm:w-[320px]">
            <label className="sr-only" htmlFor="codigo-tramite">
              Buscar por Codigo y Nombre del Tramitante
            </label>
            <input
              id="codigo-tramite"
              type="search"
              value={searchCode}
              onChange={(event) => {
                setSearchCode(event.target.value);
                setCurrentPage({ ...currentPage, [activeTab]: 1 });
              }}
              placeholder="Buscar por Codigo y Nombre del Tramitante"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>

    {/* BLOQUE 2: TABLA (centrada) */}
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-65 pb-4">
      <div className="bg-white rounded-xl shadow-[0_8px_18px_rgba(0,0,0,0.16)] border border-black/10 min-h-[320px]">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Código
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Ciudadano
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Tipo de Trámite
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTramites.map((tramite) => (
                <tr key={tramite.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                    {tramite.code || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {tramite.userName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {tramite.procedureName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {new Date(tramite.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      className={`px-6 py-2 rounded-full text-xs font-semibold ${
                        ESTADOS.find((e) => e.value === tramite.status)?.color ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ESTADOS.find((e) => e.value === tramite.status)?.label ||
                        tramite.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {(() => {
                      const isDisabled =
                        tramite.status === 'APROBADO' ||
                        tramite.status === 'RECHAZADO';
                      
                      let allowedStates = [];
                      if (tramite.status === 'PAGADO') {
                        allowedStates = ['EN_REVISION'];
                      } else if (tramite.status === 'EN_REVISION') {
                        allowedStates = ['OBSERVADO', 'APROBADO', 'RECHAZADO'];
                      } else if (tramite.status === 'OBSERVADO') {
                        allowedStates = ['APROBADO', 'RECHAZADO'];
                      }

                      return (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              cambiarEstado(tramite.id, e.target.value);
                            }
                          }}
                          disabled={isDisabled}
                          className={`text-center border-2 rounded-lg px-4 py-2 text-sm bg-white transition-all duration-200 shadow-sm ${
                            !isDisabled
                              ? 'border-gray-300 text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <option value="" disabled>
                            Seleccione un estado
                          </option>
                          {ESTADOS.filter((estado) =>
                            allowedStates.includes(estado.value)
                          ).map((estado) => (
                            <option key={estado.value} value={estado.value}>
                              {estado.label}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </td>
                </tr>
              ))}

            {!error &&
              Array.isArray(tramites) &&
              filteredTramites.length === 0 && (
                <tr className="h-[240px]">
                  <td className="text-center px-6 py-6 text-sm text-gray-500 align-middle" colSpan={6}>
                    {normalizedSearch && 'No hay trámites con ese codigo.'}
                    {!normalizedSearch && activeTab === 'PAGADO' && 'No hay trámites pagados.'}
                    {!normalizedSearch && activeTab === 'EN_REVISION' && 'No hay trámites en revisión.'}
                    {!normalizedSearch && activeTab === 'OBSERVADO' && 'No hay trámites observados.'}
                    {!normalizedSearch && activeTab === 'APROBADO' && 'No hay trámites aprobados.'}
                    {!normalizedSearch && activeTab === 'RECHAZADO' && 'No hay trámites rechazados.'}
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {filteredTramites.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-2 mt-5 pb-6">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPageNum - 1))}
            disabled={currentPageNum === 1}
            className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                pageNum === currentPageNum
                  ? 'bg-blue-700 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPageNum + 1))}
            disabled={currentPageNum === totalPages}
            className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      )}
    </div>
  </div>
  );
}