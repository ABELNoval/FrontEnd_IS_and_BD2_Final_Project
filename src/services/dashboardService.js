import api from "./api";

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
