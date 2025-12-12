import api from "./api";

  // ========================= REPORT SERVICE =========================
  export const reportService = {
  // ========================= EXPORTACIÓN (NUEVOS ENDPOINTS GET) =========================
  
  // 🔥 Exportar: Equipos dados de baja en el último año
  exportEquipmentDecommissionLastYear: async (format) => {
    return api.get(`/report/export/decommission-last-year/${format}`, {
      responseType: "blob"
    });
  },

  // 🔥 Exportar: Historial de mantenimiento por equipo
  exportEquipmentMaintenanceHistory: async (equipmentId, format) => {
    return api.get(`/report/export/maintenance-history/${equipmentId}/${format}`, {
      responseType: "blob"
    });
  },

  // 🔥 Exportar: Equipos con mantenimientos frecuentes
  exportFrequentMaintenanceEquipment: async (format) => {
    return api.get(`/report/export/frequent-maintenance/${format}`, {
      responseType: "blob"
    });
  },

  // 🔥 Exportar: Bonificación de técnicos
  exportTechnicianPreformanceBonus: async (format) => {
    return api.get(`/report/export/technician-bonus/${format}`, {
      responseType: "blob"
    });
  },

  // ========================= GET NORMALS (JSON) =========================
  // (Mantener estos para mostrar datos en la interfaz si es necesario)
  equipmentDecommissionLastYear: async () => {
    return api.get(`/report/decommission-last-year`);
  },

  equipmentMaintenanceHistory: async (equipmentId) => {
    return api.get(`/report/maintenance-history/${equipmentId}`);
  },

  frequentMaintenanceEquipment: async () => {
    return api.get(`/report/frequent-maintenance`);
  },

  technicianPerformanceBonus: async () => {
    return api.get(`/report/technician-bonus`);
  },

  // ========================= EXPORTACIÓN GENERAL (mantener por compatibilidad) =========================
  export: async (format, request) => {
    return api.post(`/report/export/${format}`, request, {
      responseType: "blob"
    });
  },
};


// ========================= CRUD SERVICE BUILDER =========================

function buildService(controllerName) {
  return {
    get: async () => {
      const res = await api.get(`/${controllerName}`);
      return res.data;
    },
    create: async (data) => {
      const res = await api.post(`/${controllerName}`, data);
      return res.data;
    },
    update: async (id, data) => {
      const res = await api.put(`/${controllerName}/${id}`, { ...data, id });
      return res.data;
    },
    delete: async (id) => {
      const res = await api.delete(`/${controllerName}/${id}`);
      return res.data;
    },
    filter: async (filter) => {
      const res = await api.post(`/${controllerName}/filter`, filter);
      return res.data;
    }
  };
}


// ========================= DASHBOARD SERVICE =========================

export const dashboardService = {
  Department: buildService("department"),
  Section: buildService("section"),
  Equipment: buildService("equipment"),
  EquipmentType: buildService("equipmentType"),
  Responsible: buildService("responsible"),

  Employee: buildService("employee"),
  Director: buildService("director"),
  Technical: buildService("technical"),

  Assessment: buildService("assessment"),
  Transfer: buildService("transfer"),
  Maintenance: buildService("maintenance"),
  EquipmentDecommission: buildService("equipmentDecommission")
};
