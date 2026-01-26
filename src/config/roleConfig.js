/**
 * Role-based table and permission configuration
 * This defines what each role can see and do
 * 
 * CATALOG TABLES (general, no filtering, visible to all):
 * - Sections, Departments, EquipmentTypes, Responsibles, Directors, Technicals, Equipments
 * - These are referenced as FK in other tables
 * - Only Admin can CRUD, others have limited access
 * 
 * ACTION TABLES (filtered by user context):
 * - Assessments, Maintenances, Transfers, TransferRequests, EquipmentDecommissions
 * - Filtered based on user's role (SectionId, TechnicalId, DepartmentId, etc.)
 */

// Catalog tables that everyone can see but only Admin can modify
const CATALOG_TABLES = [
  "Sections",
  "Departments", 
  "EquipmentTypes",
  "Responsibles",
  "Directors",
  "Technicals",
  "Equipments"  // General - referenced in Transfers, Maintenances, Decommissions, etc.
];

export const ROLE_CONFIG = {
  Administrator: {
    tables: [
      // Catalog tables (includes Equipments now)
      ...CATALOG_TABLES,
      "Employees",
      // Action tables
      "Assessments",
      "Maintenances",
      "Transfers",
      "TransferRequests",
      "EquipmentDecommissions",
      "Users"
    ],
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExportReports: true,
    dashboardTitle: "Administrator Dashboard",
    hiddenColumns: {}
  },
  
  Director: {
    tables: [
      // Catalog tables (includes Equipments now)
      ...CATALOG_TABLES,
      "Employees",
      // Action tables (full access)
      "Assessments",
      "Maintenances",
      "Transfers",
      "EquipmentDecommissions"
    ],
    // Catalog tables are read-only for Director (except Equipments which they can edit)
    readOnlyTables: ["Sections", "Departments", "EquipmentTypes", "Responsibles", "Directors", "Technicals", "Employees"],
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExportReports: true,
    dashboardTitle: "Director Dashboard",
    hiddenColumns: {}
  },
  
  Responsible: {
    tables: [
      // Catalog tables (includes Equipments - general view)
      ...CATALOG_TABLES,
      "Employees",         // View only, filtered by SectionId (employees of their section)
      // Action tables
      "Maintenances",      // View only, history of equipment
      "TransferRequests",  // Filtered by ResponsibleId (their own)
      "Transfers"          // View only, filtered by SectionId
    ],
    readOnlyTables: [...CATALOG_TABLES, "Employees", "Maintenances", "Transfers"],
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExportReports: true,
    dashboardTitle: "Responsible Dashboard",
    hiddenColumns: {}
  },
  
  Technical: {
    tables: [
      // Catalog tables - NO Responsibles (not needed for Technical)
      "Sections",
      "Departments",
      "EquipmentTypes",
      "Equipments",
      "Directors",         // For viewing directors
      "Employees",         // For RecipientId in EquipmentDecommissions (no filter, excludes Responsibles)
      // Action tables - filtered by TechnicalId
      "Maintenances",      // Filtered by TechnicalId (their own)
      "Assessments",       // Filtered by TechnicalId (their own)
      "EquipmentDecommissions" // Filtered by TechnicalId (their own)
    ],
    readOnlyTables: ["Sections", "Departments", "EquipmentTypes", "Equipments", "Directors", "Employees"],
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExportReports: false,
    dashboardTitle: "Technical Dashboard",
    // Hide TechnicalId since it's auto-filled with their ID
    hiddenColumns: {
      Maintenances: ["TechnicalId"],
      Assessments: ["TechnicalId"],
      EquipmentDecommissions: ["TechnicalId"]
    }
  },
  
  Employee: {
    tables: [
      // Only what they need to see - filtered by their department
      "Sections",         // Only their section (filtered by backend via department)
      "Departments",      // Only their department (filtered by backend)
      "Equipments",       // Only equipment in their department (filtered by backend)
      "EquipmentTypes"    // Only types of equipment in their department (filtered by backend)
    ],
    readOnlyTables: ["Sections", "Departments", "Equipments", "EquipmentTypes"],
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExportReports: false,
    dashboardTitle: "Employee Dashboard",
    hiddenColumns: {}
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

/**
 * Check if a table is read-only for a specific role
 * @param {string} role 
 * @param {string} tableName 
 * @returns {boolean}
 */
export function isTableReadOnly(role, tableName) {
  const config = getRoleConfig(role);
  return config.readOnlyTables?.includes(tableName) || false;
}

export default ROLE_CONFIG;
