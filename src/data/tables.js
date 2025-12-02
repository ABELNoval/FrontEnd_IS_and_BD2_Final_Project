export const TABLE_METADATA = {
  Departments: {
    apiPath: "/Department",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      sectionId: { type: "fk", ref: "Sections", required: true },
      responsibleId: { type: "fk", ref: "Responsibles", required: true }
    }
  },

  Sections: {
    apiPath: "/Section",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true }
    }
  },

  Responsibles: {
    apiPath: "/Responsible",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      email: {type: "string", required:true},
      departmentId: { type: "fk", ref: "Departments", required: true }
    }
  },

  Employees: {
    apiPath: "/Employee",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      email: {type: "string", required:true},
      departmentId: { type: "fk", ref: "Departments", required: false }
    }
  },

  Directors: {
    apiPath: "/Director",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      email: {type: "string", required:true}
    }
  },

  Technicals: {
    apiPath: "/Technical",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      email: {type: "string", required:true},
      speciality: {type: "string", required:true},
      experience: {type: "int", required:true}
    }
  },

  EquipmentTypes: {
    apiPath: "/EquipmentType",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      equipmentCount: { type: "number", readonly: true }
    }
  },

  Equipment: {
    apiPath: "/Equipment",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      acquisitionDate: { type: "date", required: true },
      equipmentTypeId: { type: "fk", ref: "EquipmentTypes", required: true },
      departmentId: { type: "fk", ref: "Departments", required: false },
      state: {
        type: "enum",
        values: ["Operative", "Maintenance", "Decommissioned"],
        required: true
      },
      locationType: {
        type: "enum",
        values: ["Department", "Store", "Trash"],
        required: true
      }
    }
  },

  Transfers: {
    apiPath: "/Transfer",
    columns: {
      id: { type: "uuid", readonly: true },
      equipmentId: { type: "fk", ref: "Equipment", required: true },
      fromDepartmentId: { type: "fk", ref: "Departments", required: true },
      toDepartmentId: { type: "fk", ref: "Departments", required: true },
      transferDate: { type: "date", required: true }
    }
  },

  Maintenance: {
    apiPath: "/Maintenance",
    columns: {
      id: { type: "uuid", readonly: true },
      equipmentId: { type: "fk", ref: "Equipment", required: true },
      technicalId: { type: "fk", ref: "Technicals", required: true },
      startDate: { type: "date", required: true },
      maintenanceType :{
        type: "enum",
        values: ["Prevention", "Correction", "Privention", "Emergency"],
        required: true
      },
      maintenanceDate: {type: "date", required: true}
    }
  },

  EquipmentDecommission: {
    apiPath: "/EquipmentDecommission",
    columns: {
      id: { type: "uuid", readonly: true },
      equipmentId: { type: "fk", ref: "Equipment", required: true },
      reason: { type: "string", required: true },
      decommissionDate: { type: "date", required: true },
      technicalId: {type: "fk", ref:"Technical", required: true},
      departmentId: {type: "fk", ref: "Department", required: false},
      destinyType: {
        type: "enum",
        values: ["Department", "Store", "Trash"],
        required: true
      } 
    }
  }
};
