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
    dashboardTitle: "Administrator Dashboard"
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
    dashboardTitle: "Director Dashboard"
  },
  
  Responsible: {
    // Equipment from their section, departments from their section, transfers, employees table
    tables: [
      "Departments",
      "Equipments",
      "Employees",
      "Transfers"
    ],
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExportReports: true,
    dashboardTitle: "Responsible Dashboard"
  },
  
  Technical: {
    // Equipment info, maintenances, their assessments, decommissions
    tables: [
      "Equipments",
      "Maintenances",
      "Assessments",
      "EquipmentDecommissions"
    ],
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExportReports: false,
    dashboardTitle: "Technical Dashboard"
  },
  
  Employee: {
    // Their department and equipment from their department
    tables: [
      "Departments",
      "Equipments"
    ],
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExportReports: false,
    dashboardTitle: "Employee Dashboard"
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

export default ROLE_CONFIG;
