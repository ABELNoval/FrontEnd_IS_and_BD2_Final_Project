export const TABLE_METADATA = {
  Departments: {
    apiPath: "/Departments",
    columns: {
      Id: { type: "uuid", readonly: true },
      Name: { type: "string", required: true },
      SectionId: { type: "fk", ref: "Sections", required: true }
    }
  },

  Sections: {
    apiPath: "/Sections",
    columns: {
      Id: { type: "uuid", readonly: true },
      Name: { type: "string", required: true }
    }
  },

  Responsibles: {
    apiPath: "/Responsibles",
    columns: {
      Id: { type: "uuid", readonly: true },
      Name: { type: "string", required: true },
      Email: {type: "string", required:true},
      Password: {type: "string", required:true},
      DepartmentId: {type: "fk", ref: "Departments", required: true}
    }
  },

  Employees: {
    apiPath: "/Employees",
    columns: {
      Id: { type: "uuid", readonly: true },
      Name: { type: "string", required: true },
      Email: {type: "string", required:true},
      Password: {type: "string", required:true},
      DepartmentId: { type: "fk", ref: "Departments", required: true }
    }
  },

  Directors: {
    apiPath: "/Directors",
    columns: {
      Id: { type: "uuid", readonly: true },
      Name: { type: "string", required: true },
      Email: {type: "string", required:true},
      Password: {type: "string", required:true},
  }

  },

  Technicals: {
    apiPath: "/Technicals",
    columns: {
      Id: { type: "uuid", readonly: true },
      Name: { type: "string", required: true },
      Email: {type: "string", required:true},
      Password: {type: "string", required:true},
      Specialty: {type: "string", required:true},
      Experience: {type: "number", required:true}
    }
  },

  EquipmentTypes: {
    apiPath: "/EquipmentTypes",
    columns: {
      Id: { type: "uuid", readonly: true },
      Name: { type: "string", required: true }
    }
  },

  Equipments: {
    apiPath: "/Equipments",
    columns: {
      Id: { type: "uuid", readonly: true },
      Name: { type: "string", required: true },
      AcquisitionDate: { type: "date", required: true },
      EquipmentTypeId: { type: "fk", ref: "EquipmentTypes", required: true },
      DepartmentId: { type: "fk", ref: "Departments", required: false },
      StateId: {
        type: "enum",
        values: ["Operative", "UnderMaintenance", "Decommissioned", "Disposed"],
        required: true
      },
      LocationTypeId: {
        type: "enum",
        values: ["Department", "Disposal", "Warehouse"],
        required: true
      }
    }
  },

  Transfers: {
    apiPath: "/Transfers",
    columns: {
      Id: { type: "uuid", readonly: true },
      EquipmentId: { type: "fk", ref: "Equipments", required: true },
      SourceDepartmentId: { type: "fk", ref: "Departments", required: true },
      TargetDepartmentId: { type: "fk", ref: "Departments", required: true },
      TransferDate: { type: "date", required: true },
      ResponsibleId: {type: "fk", ref: "Responsibles", required: true}
    }
  },

  Maintenances: {
    apiPath: "/Maintenances",
    columns: {
      Id: { type: "uuid", readonly: true },
      EquipmentId: { type: "fk", ref: "Equipments", required: true },
      TechnicalId: { type: "fk", ref: "Technicals", required: true },
      MaintenanceDate: {type: "date", required: true},
      MaintenanceTypeId :{
        type: "enum",
        values: ["Preventive", "Corrective", "Predective", "Emergency"],
        required: true
      },
      Cost: { type: "number", required: true },
    }
  },

  EquipmentDecommissions: {
    apiPath: "/EquipmentDecommission",
    columns: {
      Id: { type: "uuid", readonly: true },
      EquipmentId: { type: "fk", ref: "Equipments", required: true },
      Reason: { type: "string", required: true },
      DecommissionDate: { type: "date", required: true },
      TechnicalId: {type: "fk", ref: "Technicals", required: true},
      DepartmentId: {type: "fk", ref: "Departments", required: false},
      DestinyTypeId: {
        type: "enum",
        values: ["Department", "Disposal", "Warehouse"],
        required: true
      },
      RecipientId: {type: "fk", ref: "Employees", required: false}  
    }
  },

  Assessments: {
    apiPath: "/Assessments",
    columns: {
      Id: { type: "uuid", readonly: true },
      TechnicalId: { type: "fk", ref: "Technicals", required: true },
      DirectorId: { type: "fk", ref: "Directors", required: true },
      Score: { type: "number", required: true },
      Comment: { type: "string", required: false },
      AssessmentDate: { type: "date", required: true }
    }
  }
};