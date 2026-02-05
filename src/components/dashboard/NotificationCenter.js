"use client";

import { useState, useEffect, useRef } from "react";
import { Menu } from "@headlessui/react";
import { Bell, Check, X } from "lucide-react";
import { notificationsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

/**
 * Centro de notificaciones con dropdown
 * Incluye polling automático cada 5 minutos
 */
export default function NotificationCenter() {
  // Inicializar contador desde localStorage
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notificationUnreadCount");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("unread"); // 'unread' o 'all'
  const router = useRouter();
  const pollingInterval = useRef(null);

  // Guardar contador en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notificationUnreadCount", unreadCount.toString());
    }
  }, [unreadCount]);

  // Cargar notificaciones
  const fetchNotifications = async () => {
    try {
      const data = await notificationsAPI.obtenerNotificaciones();
      setNotifications(data);

      // Calcular no leídas localmente
      const unread = data.filter((n) => !n.read).length;
      console.log(
        `Notificaciones cargadas: ${data.length} total, ${unread} no leídas`,
      );
      setUnreadCount(unread);
      return data;
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      throw error;
    }
  };

  // Cargar contador de no leídas (más ligero para polling)
  const fetchUnreadCount = async () => {
    try {
      const data = await notificationsAPI.obtenerContadorNoLeidas();
      const count = data.unreadCount || 0;
      console.log("Contador actualizado desde endpoint unread-count:", count);
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error("Error al cargar contador desde unread-count:", error);
      // Propagar el error para que el polling use el fallback
      throw error;
    }
  };

  // Marcar como leída y navegar al trámite
  const handleNotificationClick = async (notification, closeMenu) => {
    console.log("Click en notificación:", notification);

    try {
      // Marcar como leída si no lo está
      if (!notification.read) {
        console.log("Marcando notificación como leída:", notification.id);
        try {
          await notificationsAPI.marcarComoLeida(notification.id);
          console.log("Notificación marcada como leída exitosamente");
        } catch (markError) {
          console.error("Error al marcar como leída:", markError);
          // Continuar con la navegación aunque falle marcar como leída
        }

        // Actualizar estado local
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Cerrar el menú
      if (closeMenu) closeMenu();

      // Navegar al detalle del trámite
      if (notification.applicationId) {
        console.log(
          "Navegando a:",
          `/dasboard/tramites/detalle/${notification.applicationId}`,
        );
        router.push(`/dasboard/tramites/detalle/${notification.applicationId}`);
      } else {
        console.warn("Notificación sin applicationId:", notification);
      }
    } catch (error) {
      console.error("Error general al procesar notificación:", error);
      console.error("Stack:", error.stack);
      alert(`Error: ${error.message || "Error desconocido"}`);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  // Formatear nombre del estado para mostrar
  const formatEstado = (estado) => {
    const estados = {
      EN_REVISION: "EN REVISIÓN",
      APROBADO: "APROBADO",
      RECHAZADO: "RECHAZADO",
      OBSERVADO: "OBSERVADO",
      PAGADO: "PAGADO",
      ENVIADO: "ENVIADO",
      BORRADOR: "BORRADOR",
    };
    return estados[estado] || estado;
  };

  // Obtener color según el estado en el subject
  const getNotificationColor = (subject) => {
    if (subject.includes("APROBADO")) return "text-green-600 bg-green-50";
    if (subject.includes("RECHAZADO")) return "text-red-600 bg-red-50";
    if (subject.includes("OBSERVADO")) return "text-yellow-600 bg-yellow-50";
    if (subject.includes("EN_REVISION")) return "text-blue-600 bg-blue-50";
    if (subject.includes("PAGADO")) return "text-purple-600 bg-purple-50";
    return "text-gray-600 bg-gray-50";
  };

  // Cargar notificaciones al abrir el dropdown
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
      // Resetear a tab de nuevas al abrir
      setActiveTab("unread");
    }
  }, [isOpen]);

  // Filtrar notificaciones según tab activo
  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  // Polling: cargar contador cada 5 minutos (optimizado para reducir carga del servidor)
  useEffect(() => {
    // Carga inicial: usar fetchNotifications para obtener el contador real
    console.log(
      "Componente NotificationCenter montado, cargando notificaciones iniciales...",
    );
    fetchNotifications().then(() => {
      console.log("Notificaciones iniciales cargadas");
    });

    // Configurar polling (usa el endpoint ligero)
    pollingInterval.current = setInterval(() => {
      console.log("Polling: actualizando contador...");
      // Intentar con el endpoint ligero, pero si falla, usar fetchNotifications
      fetchUnreadCount().catch(() => {
        console.log(
          "Endpoint unread-count falló, usando fetchNotifications como fallback",
        );
        fetchNotifications();
      });
    }, 300000); // 5 minutos (300000ms)

    // Limpiar intervalo al desmontar
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  return (
    <Menu as="div" className="relative">
      {({ open, close }) => (
        <>
          <Menu.Button
            className="relative p-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            onClick={() => setIsOpen(open)}
          >
            <Bell className="w-6 h-6 text-white opacity-95" />

            {/* Badge de contador */}
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Menu.Button>

          <Menu.Items className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 divide-y divide-gray-100 focus:outline-none z-50 max-h-125 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">
                Notificaciones
              </h3>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setActiveTab("unread")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "unread"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Nuevas
                {unreadCount > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === "unread"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "all"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Todas
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === "all"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {notifications.length}
                </span>
              </button>
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm">Cargando...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">
                    {activeTab === "unread"
                      ? "No hay notificaciones nuevas"
                      : "No hay notificaciones"}
                  </p>
                  <p className="text-xs mt-1">
                    {activeTab === "unread"
                      ? "¡Estás al día!"
                      : "Te avisaremos cuando haya novedades"}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <Menu.Item key={notification.id}>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleNotificationClick(notification, close);
                        }}
                        className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                          active ? "bg-blue-50" : ""
                        } ${!notification.read ? "bg-blue-50/30" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Indicador de no leída */}
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                          )}

                          <div className="flex-1 min-w-0">
                            {/* Subject con color */}
                            <p
                              className={`text-xs font-medium px-2 py-0.5 rounded inline-block mb-1 ${getNotificationColor(notification.subject)}`}
                            >
                              {formatEstado(
                                notification.subject.replace(
                                  "Cambio de estado: ",
                                  "",
                                ),
                              )}
                            </p>

                            {/* Mensaje */}
                            <p
                              className={`text-sm ${
                                notification.read
                                  ? "text-gray-600"
                                  : "text-gray-900 font-medium"
                              }`}
                            >
                              {notification.message}
                            </p>

                            {/* Fecha */}
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(notification.sentAt)}
                            </p>
                          </div>

                          {/* Checkmark para leídas */}
                          {notification.read && (
                            <Check className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                          )}
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                ))
              )}
            </div>
          </Menu.Items>
        </>
      )}
    </Menu>
  );
}
