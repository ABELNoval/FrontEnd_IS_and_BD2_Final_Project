import api from "./api";


// En dashboardService.js, después de la definición de buildService
export const reportService = {
  export: async (format) => {
    return api.get(`/report?format=${format}`, {
      responseType: "blob"
    });
  },
  // Agregar nuevos endpoints para consultas específicas
  equipmentDecommissionLastYear: async (format) => {
    return api.get(`/report/equipment-decommission-last-year?format=${format}`, {
      responseType: "blob"
    });
  },
  equipmentMaintenanceHistory: async (equipmentId, format) => {
    return api.get(`/report/equipment-maintenance-history/${equipmentId}?format=${format}`, {
      responseType: "blob"
    });
  },
  equipmentTransfers: async (format) => {
    return api.get(`/report/equipment-transfers?format=${format}`, {
      responseType: "blob"
    });
  },
  technicianPerformanceCorrelation: async (format) => {
    return api.get(`/report/technician-performance-correlation?format=${format}`, {
      responseType: "blob"
    });
  },
  frequentMaintenanceEquipment: async (format) => {
    return api.get(`/report/frequent-maintenance-equipment?format=${format}`, {
      responseType: "blob"
    });
  },
  technicianPerformanceBonus: async (format) => {
    return api.get(`/report/technician-performance-bonus?format=${format}`, {
      responseType: "blob"
    });
  },
  equipmentToDepartment: async (departmentId, format) => {
    return api.get(`/report/equipment-to-department/${departmentId}?format=${format}`, {
      responseType: "blob"
    });
  }
};

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
