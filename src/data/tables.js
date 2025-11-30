// src/metadata/tables.js
// Metadata central de tablas — usar para generar UI genérica y validar antes de enviar al backend.

export const TABLE_METADATA = {
  Departments: {
    apiPath: "/department",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      sectionId: { type: "fk", ref: "Sections", required: true },
      responsibleId: { type: "fk", ref: "Responsibles", required: true }
    }
  },

  Sections: {
    apiPath: "/section",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true }
    }
  },

  EquipmentTypes: {
    apiPath: "/equipmenttype",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      equipmentCount: { type: "number", readonly: true }
    }
  },

  Equipment: {
    apiPath: "/equipment",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      acquisitionDate: { type: "date", required: true },
      equipmentTypeId: { type: "fk", ref: "EquipmentTypes", required: true },
      departmentId: { type: "fk", ref: "Departments", required: false },
      state: { type: "enum", values: ["Operative", "Maintenance", "Decommissioned"], required: true },
      locationType: { type: "enum", values: ["Warehouse", "Room", "Laboratory"], required: true }
    }
  },

  Responsibles: {
    apiPath: "/responsible",
    columns: {
      id: { type: "uuid", readonly: true },
      userId: { type: "fk", ref: "Users", required: true },
      departmentId: { type: "fk", ref: "Departments", required: true }
    }
  }
};
