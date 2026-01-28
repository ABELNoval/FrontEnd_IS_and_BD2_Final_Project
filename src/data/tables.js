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
      AcquisitionDate: { type: "date", required: false, hidden: true }, // Auto-set to today
      EquipmentTypeId: { type: "fk", ref: "EquipmentTypes", required: true },
      DepartmentId: { type: "fk", ref: "Departments", required: false },
      TechnicalId: { type: "fk", ref: "Technicals", required: true }, // Technical for initial maintenance
      StateId: {
        type: "enum",
        values: ["Operative", "UnderMaintenance", "Decommissioned", "Disposed"],
        required: false,
        hidden: true, // Auto-set to UnderMaintenance
        readonly: true
      },
      LocationTypeId: {
        type: "enum",
        values: ["Department", "Disposal", "Warehouse"],
        required: false,
        hidden: true // Auto-set based on DepartmentId
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
      TransferDate: { type: "date", required: false, hidden: true }, // Auto-set to today
      ResponsibleId: { type: "fk", ref: "Responsibles", required: true },
      RecipientId: { type: "fk", ref: "Technicals", required: true } // Technical receiving the equipment
    }
  },

  TransferRequests: {
    apiPath: "/TransferRequest",
    columns: {
      Id: { type: "uuid", readonly: true },
      EquipmentId: { type: "fk", ref: "Equipments", required: true },
      TargetDepartmentId: { type: "fk", ref: "Departments", required: true },
      RequestedTransferDate: { type: "date", required: true }, // User picks desired date
      StatusId: {
        type: "enum",
        values: ["Pending", "Accepted", "Denied", "Cancelled"],
        required: true,
        readonly: true
      },
      ResolverId: { type: "fk", ref: "Responsibles", readonly: true } // Director who resolved the request
    },
    // Special table with action buttons instead of edit/delete
    hasActions: true,
    actionTable: true
  },

  Maintenances: {
    apiPath: "/Maintenances",
    columns: {
      Id: { type: "uuid", readonly: true },
      EquipmentId: { type: "fk", ref: "Equipments", required: true },
      TechnicalId: { type: "fk", ref: "Technicals", required: true },
      MaintenanceDate: { type: "date", required: false, hidden: true }, // Auto-set to today
      EndDate: { type: "date", readonly: true, required: false },
      StatusId: {
        type: "enum",
        values: ["InProgress", "Completed"],
        required: false,
        readonly: true,
        hidden: true // Auto-set to InProgress
      },
      MaintenanceTypeId :{
        type: "enum",
        values: ["Preventive", "Corrective", "Predictive", "Emergency"],
        required: true
      },
      Cost: { type: "number", required: true },
    },
    // Special table with action buttons
    hasActions: true,
    actionTable: true
  },

  EquipmentDecommissions: {
    apiPath: "/EquipmentDecommission",
    columns: {
      Id: { type: "uuid", readonly: true },
      EquipmentId: { type: "fk", ref: "Equipments", required: true },
      Reason: { type: "string", required: true },
      DecommissionDate: { type: "date", required: false, hidden: true }, // Auto-set to today
      CompletionDate: { type: "date", readonly: true }, // Set automatically based on destiny
      TechnicalId: {type: "fk", ref: "Technicals", required: true},
      DepartmentId: {type: "fk", ref: "Departments", required: false},
      DestinyTypeId: {
        type: "enum",
        values: ["Department", "Disposal", "Warehouse"],
        required: true
      },
      RecipientId: {type: "fk", ref: "Employees", required: false}  
    },
    hasActions: true,  // Enable actions column
    actionTable: true  // Mark as an action table
  },

  Assessments: {
    apiPath: "/Assessments",
    columns: {
      Id: { type: "uuid", readonly: true },
      TechnicalId: { type: "fk", ref: "Technicals", required: true },
      DirectorId: { type: "fk", ref: "Directors", required: true },
      Score: { type: "number", required: true },
      Comment: { type: "string", required: false },
      AssessmentDate: { type: "date", required: false, hidden: true } // Auto-set to today
    }
  },

  Users: {
    apiPath: "/User",
    columns: {
      Id: { type: "uuid", readonly: true },
      Name: { type: "string", readonly: true },
      Email: { type: "string", readonly: true },
      Role: { type: "string", readonly: true }
    },
    viewOnly: true  // Cannot create or edit, only view and delete
  }
};