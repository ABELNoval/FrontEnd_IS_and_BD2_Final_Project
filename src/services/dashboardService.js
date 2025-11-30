import api from './api';

export const dashboardService = {
  // ============================================
  // DEPARTMENTS
  // ============================================
  getDepartments: async () => {
    const response = await api.get('/Department');
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await api.post('/Department', data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await api.put(`/Department/${id}`, { ...data, id });
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/Department/${id}`);
    return response.data;
  },

  // ============================================
  // SECTIONS
  // ============================================
  getSections: async () => {
    const response = await api.get('/Section');
    return response.data;
  },

  createSection: async (data) => {
    const response = await api.post('/Section', data);
    return response.data;
  },

  updateSection: async (id, data) => {
    const response = await api.put(`/Section/${id}`, { ...data, id });
    return response.data;
  },

  deleteSection: async (id) => {
    const response = await api.delete(`/Section/${id}`);
    return response.data;
  },

  // ============================================
  // RESPONSIBLES
  // ============================================
  getResponsibles: async () => {
    const response = await api.get('/Responsible');
    return response.data;
  },

  createResponsible: async (data) => {
    const response = await api.post('/Responsible', data);
    return response.data;
  },

  updateResponsible: async (id, data) => {
    const response = await api.put(`/Responsible/${id}`, { ...data, id });
    return response.data;
  },

  deleteResponsible: async (id) => {
    const response = await api.delete(`/Responsible/${id}`);
    return response.data;
  },

  // ============================================
  // EQUIPMENT
  // ============================================
  getEquipment: async () => {
    const response = await api.get('/Equipment');
    return response.data;
  },

  createEquipment: async (data) => {
    const response = await api.post('/Equipment', data);
    return response.data;
  },

  updateEquipment: async (id, data) => {
    const response = await api.put(`/Equipment/${id}`, { ...data, id });
    return response.data;
  },

  deleteEquipment: async (id) => {
    const response = await api.delete(`/Equipment/${id}`);
    return response.data;
  },

  // ============================================
  // EQUIPMENT TYPES
  // ============================================
  getEquipmentTypes: async () => {
    const response = await api.get('/EquipmentType');
    return response.data;
  },

  createEquipmentType: async (data) => {
    const response = await api.post('/EquipmentType', data);
    return response.data;
  },

  updateEquipmentType: async (id, data) => {
    const response = await api.put(`/EquipmentType/${id}`, { ...data, id });
    return response.data;
  },

  deleteEquipmentType: async (id) => {
    const response = await api.delete(`/EquipmentType/${id}`);
    return response.data;
  }
};
