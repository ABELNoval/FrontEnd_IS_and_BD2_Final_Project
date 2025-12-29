/**
 * Role-based table and permission configuration
 * This defines what each role can see and do
 */

export const ROLE_CONFIG = {
  Administrator: {
    tables: [
      "Departments",
      "EquipmentTypes", 
      "Responsibles",
      "Employees",
      "Directors",
      "Technicals",
      "Sections",
      "Equipments",
      "Assessments",
      "Maintenances",
      "Transfers",
      "EquipmentDecommissions",
      "Users"
    ],
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExportReports: true,
    dashboardTitle: "Administrator Dashboard",
    hiddenColumns: {} // No hidden columns for admin
  },
  
  Director: {
    tables: [
      "Departments",
      "EquipmentTypes",
      "Sections",
      "Equipments",
      "Assessments",
      "Maintenances",
      "Transfers",
      "EquipmentDecommissions",
      // Can view but not edit these:
      "Directors",
      "Employees",
      "Technicals",
      "Responsibles"
    ],
    // Tables that Director can only view (no create/edit/delete)
    readOnlyTables: ["Directors", "Employees", "Technicals", "Responsibles"],
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExportReports: true,
    dashboardTitle: "Director Dashboard",
    hiddenColumns: {} // No hidden columns for director
  },
  
  Responsible: {
    // Equipment from their section, departments from their section, transfers, employees table
    tables: [
      "Departments",
      "EquipmentTypes",
      "Equipments",
      "Employees",
      "TransferRequests",
      "Transfers"
    ],
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExportReports: true,
    dashboardTitle: "Responsible Dashboard",
    // Hide columns that reference filtered data (their own section)
    hiddenColumns: {
      Departments: ["SectionId"], // Departments are already filtered by section
    }
  },
  
  Technical: {
    // Equipment info, maintenances, their assessments, decommissions
    tables: [
      "Departments",
      "Sections",
      "EquipmentTypes",
      "Equipments",
      "Maintenances",
      "Assessments",
      "EquipmentDecommissions"
    ],
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExportReports: false,
    dashboardTitle: "Technical Dashboard",
    // Hide TechnicalId columns since they're filtered by the user's own ID
    hiddenColumns: {
      Maintenances: ["TechnicalId"],
      Assessments: ["TechnicalId"],
      EquipmentDecommissions: ["TechnicalId"]
    }
  },
  
  Employee: {
    // Their department and equipment from their department
    tables: [
      "Departments",
      "EquipmentTypes",
      "Equipments"
    ],
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExportReports: false,
    dashboardTitle: "Employee Dashboard",
    // Hide DepartmentId since they only see their own department
    hiddenColumns: {
      Equipments: ["DepartmentId"],
      Departments: ["SectionId"] // They don't have access to sections
    }
  }
};

/**
 * Get configuration for a specific role
 * @param {string} role 
 * @returns {object}
 */
export function getRoleConfig(role) {
  return ROLE_CONFIG[role] || ROLE_CONFIG.Employee;
}

/**
 * Get hidden columns for a specific role and table
 * @param {string} role 
 * @param {string} tableName 
 * @returns {string[]}
 */
export function getHiddenColumns(role, tableName) {
  const config = getRoleConfig(role);
  return config.hiddenColumns?.[tableName] || [];
}

export default ROLE_CONFIG;
