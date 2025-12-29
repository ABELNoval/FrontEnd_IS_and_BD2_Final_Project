import api from "./api";

  // ========================= REPORT SERVICE =========================
  export const reportService = {
  // ========================= EXPORT (NEW GET ENDPOINTS) =========================
  
  // 🔥 Export: Decommissioned equipment in the last year
  exportEquipmentDecommissionLastYear: async (format) => {
    return api.get(`/report/export/decommission-last-year/${format}`, {
      responseType: "blob"
    });
  },

  // 🔥 Export: Equipment maintenance history
  exportEquipmentMaintenanceHistory: async (equipmentId, format) => {
    return api.get(`/report/export/maintenance-history/${equipmentId}/${format}`, {
      responseType: "blob"
    });
  },

  // 🔥 Export: Equipment with frequent maintenance
  exportFrequentMaintenanceEquipment: async (format) => {
    return api.get(`/report/export/frequent-maintenance/${format}`, {
      responseType: "blob"
    });
  },

  // 🔥 Export: Technician bonuses
  exportTechnicianPreformanceBonus: async (format) => {
    return api.get(`/report/export/technician-bonus/${format}`, {
      responseType: "blob"
    });
  },

    // Transfers between sections
  exportEquipmentTransfersBetweenSections: async (format) => {
    return api.get(`/report/export/equipment-transfers-between-sections/${format}`, {
      responseType: "blob"
    });
  },

  // Technician correlation (worst performers)
  exportTechnicianCorrelationWorst: async (format) => {
    return api.get(`/report/export/technician-correlation-worst/${format}`, {
      responseType: "blob"
    });
  },

  // Equipment sent to a specific department
  exportEquipmentSentToDepartment: async (departmentId, format) => {
    return api.get(`/report/export/equipment-sent-to-department/${departmentId}/${format}`, {
      responseType: "blob"
    });
  },
  // ========================= GET NORMALS (JSON) =========================
  // (Keep these to display data in the interface if needed)
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

  // ========================= GENERAL EXPORT (keep for compatibility) =========================
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
  Department: {
    ...buildService("Department"),
    // Get all departments without role filtering (for dropdowns in TransferRequests)
    getAll: async () => {
      const res = await api.get("/Department/all");
      return res.data;
    }
  },
  Section: buildService("Section"),
  Equipment: buildService("Equipment"),
  EquipmentType: buildService("EquipmentType"),
  Responsible: buildService("Responsible"),

  Employee: buildService("Employee"),
  Director: buildService("Director"),
  Technical: buildService("Technical"),

  Assessment: buildService("Assessment"),
  Transfer: buildService("Transfer"),
  Maintenance: buildService("Maintenance"),
  EquipmentDecommission: buildService("EquipmentDecommission"),
  
  // TransferRequest service with special actions
  TransferRequest: {
    ...buildService("TransferRequest"),
    accept: async (id) => {
      const res = await api.post(`/TransferRequest/${id}/accept`);
      return res.data;
    },
    deny: async (id) => {
      const res = await api.post(`/TransferRequest/${id}/deny`);
      return res.data;
    },
    cancel: async (id) => {
      const res = await api.post(`/TransferRequest/${id}/cancel`);
      return res.data;
    }
  },
  
  // User service with special update for role
  User: {
    ...buildService("User"),
    updateRole: async (id, roleId) => {
      const res = await api.put(`/User/${id}/role`, { roleId });
      return res.data;
    }
  }
};
