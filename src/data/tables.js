export const TABLE_METADATA = {
  Departments: {
    apiPath: "/Departments",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      sectionId: { type: "fk", ref: "Sections", required: true }
    }
  },

  Sections: {
    apiPath: "/Sections",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      responsibleId: { type: "fk", ref: "Responsibles", required: true }
    }
  },

  Responsibles: {
    apiPath: "/Responsibles",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      email: {type: "string", required:true},
      password: {type: "string", required:true},
      departmentId: {type: "fk", ref: "Departments", required: true}
    }
  },

  Employees: {
    apiPath: "/Employees",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      email: {type: "string", required:true},
      password: {type: "string", required:true},
      departmentId: { type: "fk", ref: "Departments", required: true }
    }
  },

  Directors: {
    apiPath: "/Directors",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      email: {type: "string", required:true},
      password: {type: "string", required:true},
  }

  },

  Technicals: {
    apiPath: "/Technicals",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      email: {type: "string", required:true},
      password: {type: "string", required:true},
      speciality: {type: "string", required:true},
      experience: {type: "int", required:true}
    }
  },

  EquipmentTypes: {
    apiPath: "/EquipmentTypes",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      equipmentCount: { type: "number", readonly: true }
    }
  },

  Equipment: {
    apiPath: "/Equipments",
    columns: {
      id: { type: "uuid", readonly: true },
      name: { type: "string", required: true },
      acquisitionDate: { type: "date", required: true },
      equipmentTypeId: { type: "fk", ref: "EquipmentTypes", required: true },
      departmentId: { type: "fk", ref: "Departments", required: false },
      state: {
        type: "enum",
        values: ["Operative", "UnderMaintenance", "Decommissioned", "Disposed"],
        required: true
      },
      locationType: {
        type: "enum",
        values: ["Department", "DIsposal", "Warehouse"],
        required: true
      }
    }
  },

  Transfers: {
    apiPath: "/Transfers",
    columns: {
      id: { type: "uuid", readonly: true },
      equipmentId: { type: "fk", ref: "Equipment", required: true },
      SourceDepartmentId: { type: "fk", ref: "Departments", required: true },
      TargetDepartmentId: { type: "fk", ref: "Departments", required: true },
      transferDate: { type: "date", required: true },
      ResponsibleId: {type: "fk", ref: "Responsibles", required: true}
    }
  },

  Maintenance: {
    apiPath: "/Maintenances",
    columns: {
      id: { type: "uuid", readonly: true },
      equipmentId: { type: "fk", ref: "Equipments", required: true },
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
      equipmentId: { type: "fk", ref: "Equipments", required: true },
      reason: { type: "string", required: true },
      decommissionDate: { type: "date", required: true },
      technicalId: {type: "fk", ref: "Technicals", required: true},
      departmentId: {type: "fk", ref: "Departments", required: false},
      destinyType: {
        type: "enum",
        values: ["Department", "Store", "Trash"],
        required: true
      } 
    },

    Assessments : {
      apiPath: "/Assessments",
      columns: {
        id: { type: "uuid", readonly: true },
        technicalId: { type: "fk", ref: "Technicals", required: true },
        directorId: { type: "fk", ref: "Directors", required: true },
        score: { type: "number", required: true },
        comment: { type: "string", required: false },
        assessmentDate: { type: "date", required: true }
      }
    }
  }
};