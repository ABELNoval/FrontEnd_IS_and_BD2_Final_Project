import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TableSelector from "../components/Dashboard/TableSelector.jsx";
import TableViewer from "../components/Dashboard/TablesViewer.jsx";
import CreateForm from "../components/Dashboard/CreateForm.jsx";
import ErrorPanel from "../components/Dashboard/ErrorPanel.jsx";
import Panel from "../components/Panel/Panel.jsx";
import Button from "../components/Button/Button.jsx";
import Input from "../components/Input/Input.jsx";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle.jsx";
import { reportService, dashboardService } from "../services/dashboardService.js";
import authService from "../services/authService.js";
import { getRoleConfig, getHiddenColumns } from "../config/roleConfig.js";
import { TABLE_METADATA } from "../data/tables.js";
import { downloadBlob } from "../utils/download.js";
import "../styles/pages/Dashboard.css";

// =====================================
// 1) ALL TABLE SERVICES
// =====================================
const TABLE_SERVICES = {
  Departments: dashboardService.Department,
  Sections: dashboardService.Section,
  Equipments: dashboardService.Equipment,
  Responsibles: dashboardService.Responsible,
  EquipmentTypes: dashboardService.EquipmentType,

  Technicals: dashboardService.Technical,
  Employees: dashboardService.Employee,
  Directors: dashboardService.Director,

  Assessments: dashboardService.Assessment,
  Maintenances: dashboardService.Maintenance,
  Transfers: dashboardService.Transfer,
  TransferRequests: dashboardService.TransferRequest,
  EquipmentDecommissions: dashboardService.EquipmentDecommission,
  
  // Users table (all users with role management)
  Users: dashboardService.User
};

// =====================================
// COLUMNAS DEFAULT
// =====================================
const DEFAULT_COLUMNS = {
  Departments: ["Id", "Name", "SectionId"],
  Sections: ["Id", "Name"],
  Equipments: ["Id", "Name", "AcquisitionDate", "EquipmentTypeId", "DepartmentId", "StateId", "LocationTypeId"],
  Responsibles: ["Id", "Name", "Email", "Password", "DepartmentId"],
  EquipmentTypes: ["Id", "Name"],
  Technicals: ["Id", "Name", "Email", "Password", "Specialty", "Experience"],
  Employees: ["Id", "Name", "Email", "Password", "DepartmentId"],
  Directors: ["Id", "Name", "Email", "Password"],
  Assessments: ["Id", "TechnicalId", "DirectorId", "Score", "Comment", "AssessmentDate"],
  Maintenances: ["Id", "EquipmentId", "TechnicalId", "MaintenanceDate", "MaintenanceTypeId", "Cost"],
  Transfers: ["Id", "EquipmentId", "SourceDepartmentId", "TargetDepartmentId", "ResponsibleId", "TransferDate"],
  TransferRequests: ["Id", "EquipmentId", "TargetDepartmentId", "RequesterId", "RequestedTransferDate", "StatusId", "CreatedAt"],
  EquipmentDecommissions: ["Id", "EquipmentId", "TechnicalId", "DepartmentId", "RecipientId", "DestinyTypeId", "DecommissionDate", "Reason"],
  Users: ["Id", "Name", "Email", "RoleId", "Role"]
};

const allTableNames = [
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
  "TransferRequests",
  "EquipmentDecommissions",
  "Users"
];

const enumsValues = {
  "StateId" : {"Operative": 1, "UnderMaintenance": 2, "Decommissioned": 3, "Disposed" : 4},
  "MaintenanceTypeId": {"Preventive":1, "Corrective":2, "Predective":3, "Emergency":4},
  "DestinyTypeId" :{"Department":1, "Disposal":2, "Warehouse":3},
  "StatusId": {"Pending": 1, "Accepted": 2, "Denied": 3, "Cancelled": 4},
  "LocationTypeId" : {"Department":1, "Warehouse":2, "Disposal":3},
  "RoleId": {"Administrator": 1, "Director": 2, "Technical": 3, "Employee": 4, "Responsible": 5, "Receptor": 6}
};

// =====================================
// TRANSFORM TABLE FORMAT
// =====================================  
const transformToTableFormat = (data, tableName) => {
  const defaultColumns = DEFAULT_COLUMNS[tableName] || [];

  if (!data || data.length === 0) {
    return {
      name: tableName,
      columns: ["visualId", ...defaultColumns],
      rows: []
    };
  }

  const columns = ["visualId", ...Object.keys(data[0])];

  return {
    name: tableName,
    columns,
    rows: data.map((item, index) => {
      const row = {
        visualId: index + 1,
        ...item
      };
      // Dynamic foreign key detection
      Object.keys(item).forEach((key) => {
        if (key.endsWith("Id")) {
          var refTable = key.replace("Id", "");
          if (key.startsWith("Source") || key.startsWith("Target")) { refTable = "Department";} 
          const upRefTable = refTable.charAt(0).toLocaleUpperCase() + refTable.slice(1) + "s";
          if (allTableNames.includes(upRefTable)) {
            row[key] = {
              isForeign: true,
              ref: upRefTable,
              value: item[key],
              visual: null
            };
          }
        }
      });

      return row;
    })
  };
};

// =====================================
// COMPONENTE PRINCIPAL
// =====================================
function Dashboard() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filteredRows, setFilteredRows] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [reportOpen, setReportOpen] = useState(false);
  const [globalErrors, setGlobalErrors] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]); // All departments for FK dropdowns
  const [allEquipments, setAllEquipments] = useState([]); // All equipments for report selectors
  const navigate = useNavigate();

  // =====================================
  // ROLE-BASED CONFIGURATION
  // =====================================
  const user = authService.getUser();
  const userRole = user?.role || user?.Role || 'Employee';
  const roleConfig = useMemo(() => getRoleConfig(userRole), [userRole]);
  
  // Filter table names based on role
  const allowedTableNames = useMemo(() => {
    return roleConfig.tables.filter(name => TABLE_SERVICES[name]);
  }, [roleConfig]);

  // =====================================
  // Selected report type
  // =====================================
  const [selectedReport, setSelectedReport] = useState("default");

  // =====================================
  // Specific filters for reports
  // =====================================
  const [reportFilter, setReportFilter] = useState({
    equipmentId: "",    
    departmentId: "" 
  });

  // =====================================
  // LOAD ALL TABLES
  // =====================================
  useEffect(() => {
    loadAllTables();
  }, [allowedTableNames]);

  const loadAllTables = async () => {
    setLoading(true);

    try {
      // Only load tables allowed for this role
      const tableNames = allowedTableNames;

      const data = await Promise.all(tableNames.map(async (table) => {
        const result = await TABLE_SERVICES[table].get().catch(() => []);
        return transformToTableFormat(result, table);
      }));

      // Load all departments for FK dropdowns (unfiltered)
      try {
        const allDepts = await dashboardService.Department.getAll();
        setAllDepartments(allDepts);
      } catch (err) {
        console.error("Error loading all departments:", err);
      }

      // Load all equipments for report selectors (unfiltered)
      try {
        const allEquips = await dashboardService.Equipment.getAll();
        setAllEquipments(allEquips);
      } catch (err) {
        console.error("Error loading all equipments:", err);
      }

      // una vez cargadas → resolvemos visualId de FK
      const resolved = resolveForeignKeysVisualIds(data);
      setTables(resolved);

    } catch (err) {
      console.error("Load error:", err);
    }

    setLoading(false);
  };

  // ====================================================
  // RELOAD TABLE
  // ===================================================
  const reloadTable = async (tableName) => {
    try {
      const srv = TABLE_SERVICES[tableName];
      const data = await srv.get();

      const updatedTable = transformToTableFormat(data, tableName);

      const updatedTables = resolveForeignKeysVisualIds(
        tables.map(t => t.name === tableName ? updatedTable : t)
      );

      setTables(updatedTables);

      // Return updated table to Dashboard
      return updatedTables.find(t => t.name === tableName);

    } catch (e) {
      console.error("Error reloading table", tableName, e);
    }
  };

  // =====================================================
  // Resolver visualId de foreign keys
  // =====================================================
  const resolveForeignKeysVisualIds = (tablesList) => {
    return tablesList.map(table => ({
      ...table,
      rows: table.rows.map(row => {
        const newRow = { ...row };

        Object.keys(newRow).forEach(key => {
          const cell = newRow[key];
          if (cell?.isForeign) {
            const refTable = tablesList.find(t => t.name === cell.ref);
            const refRow = refTable?.rows.find(r => r.Id === cell.value);
            if (refRow) cell.visual = refRow.visualId;
          }
        });

        return newRow;
      })
    }));
  };

  // =====================================
  // Build filter for backend when it's a FK (e.g. departmentId.name)
  // =====================================
  const buildBackendFilter = async (key, value) => {
    const [fk, subProp] = key.split(".");

    // Only handle FK-like keys such as "departmentId.name"
    if (!fk || !subProp || !/Id$/i.test(fk)) return null;

    const base = fk.replace(/Id$/i, "");
    const serviceKey = base.charAt(0).toUpperCase() + base.slice(1);
    const service = dashboardService[serviceKey];

    if (!service || !service.get) return null;

    try {
      const relatedRows = await service.get();

      // Defensive: ensure we only try to read object properties and ignore malformed rows
      const matches = (relatedRows || []).filter((r) => {
        if (!r || typeof r !== "object") return false;
        const val = r[subProp];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(value.toLowerCase());
      });

      // collect only valid ids
      const ids = matches.map((r) => r && r.Id).filter(Boolean);
      if (ids.length === 0) return null;

      if (ids.length === 1) {
        return `${fk} == "${ids[0]}"`;
      }

      const idList = ids.map((id) => `"${id}"`).join(", ");
      return `${fk} in (${idList})`;
    } catch (e) {
      console.error("buildBackendFilter error:", e);
      return null;
    }
  };

  // =====================================
  // SELECT TABLE
  // =====================================
  const handleSelectTable = (tableName) => {
    const found = tables.find(t => t.name === tableName);
    setSelectedTable(found);
    setSelectedRows(new Set());
    setShowCreateForm(false); 
    setEditingItem(null);
    setFilteredRows(null);
    setCurrentPage(1);
  };

  // ================================
  // FOREIGN CLICK
  // ================================
  const handleForeignClick = (refTable, targetId) => {
    const table = tables.find(t => t.name === refTable);

    if (selectedTable?.name === refTable) {
      toggleRowSelection(targetId);
    } else {
      setSelectedTable(table);
      setTimeout(() => setSelectedRows(new Set([targetId])), 0);
    }
  };

  // ================================
  // ROW SELECTION
  // ================================
  const toggleRowSelection = (id) => {
    setSelectedRows(prev => {
      const set = new Set(prev);
      set.has(id) ? set.delete(id) : set.add(id);
      return set;
    });
  };

  // =====================================
  // HELPER FUNCTION: Generate file names
  // =====================================
  const generateFileName = (reportType, format) => {
    const reportNames = {
      default: "general-report",
      equipmentDecommissionLastYear: "decommissioned-equipment",
      equipmentMaintenanceHistory: `maintenance-history-${reportFilter.equipmentId || "equipment"}`,
      equipmentTransfers: "transferred-equipment",
      technicianPerformanceCorrelation: "technician-performance-correlation",
      frequentMaintenanceEquipment: "frequent-maintenance-equipment",
      technicianPerformanceBonus: "technician-bonus-performance",
      equipmentToDepartment: `equipment-department-${reportFilter.departmentId || "department"}`
    };
    
    const extensions = {
      pdf: "pdf",
      excel: "xlsx",
      word: "docx"
    };
    
    const baseName = reportNames[reportType] || "report";
    const extension = extensions[format] || "pdf";
    const today = new Date().toISOString().split('T')[0];
    
    return `${baseName}-${today}.${extension}`;
  };

  // ================================
  // EXPORT REPORT FUNCTION
  // ================================
  const handleExportReport = async () => {
    try {
      let response;
      
      if (selectedReport === "equipmentMaintenanceHistory" && !reportFilter.equipmentId) {
        alert("⚠️ Please select an equipment for maintenance history");
        return;
      }
      
      if (selectedReport === "equipmentToDepartment" && !reportFilter.departmentId) {
        alert("⚠️ Please select a department");
        return;
      }

      switch (selectedReport) {
        case "equipmentDecommissionLastYear":
          console.log("📋 Exporting report 1: Decommissioned equipment (last year)");
          response = await reportService.exportEquipmentDecommissionLastYear(exportFormat);
          break;
          
        case "equipmentMaintenanceHistory":
          console.log(`🔧 Exporting report 2: Equipment history ${reportFilter.equipmentId}`);
          response = await reportService.exportEquipmentMaintenanceHistory(
            reportFilter.equipmentId, 
            exportFormat
          );
          break;
          
        case "equipmentTransfers":
          console.log("🚚 Exporting report 3: Equipment transferred between sections");
          response = await reportService.exportEquipmentTransfersBetweenSections(exportFormat);
          break;
          
        case "technicianPerformanceCorrelation":
          console.log("📈 Exporting report 4: Technician performance correlation");
          response = await reportService.exportTechnicianCorrelationWorst(exportFormat);
          break;
          
        case "frequentMaintenanceEquipment":
          console.log("⚠️ Exporting report 5: Equipment with 3+ maintenances");
          response = await reportService.exportFrequentMaintenanceEquipment(exportFormat);
          break;
          
        case "technicianPerformanceBonus":
          console.log("💰 Exporting report 6: Technician performance for bonuses");
          response = await reportService.exportTechnicianPreformanceBonus(exportFormat);
          break;
          
        case "equipmentToDepartment":
          console.log(`📦 Exporting report 7: Equipment to department ${reportFilter.departmentId}`);
          response = await reportService.exportEquipmentSentToDepartment(
            reportFilter.departmentId, 
            exportFormat
          );
          break;
          
        default:
          console.log("Exporting general report of current table");
          response = await reportService.export(exportFormat);
          break;
      }

      const fileName = generateFileName(selectedReport, exportFormat);
      downloadBlob(response, fileName);
      alert(`Report generated: ${fileName}`);
      setReportOpen(false);
      
    } catch (e) {
      console.error("❌ Error exporting report:", e);
      alert("❌ Error generating report. Please verify the backend is running.");
    }
  };

  // ================================
  // CREAR / UPDATE / DELETE
  // ================================
  const toggleCreateForm = () => {
    setShowCreateForm(prev => !prev);
    setEditingItem(null);
  };

  // Replace GUIDs in error messages with human-readable names
  const humanizeErrorMessage = (msg) => {
    if (!msg || typeof msg !== 'string') return msg;
    
    // GUID regex pattern
    const guidPattern = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
    
    return msg.replace(guidPattern, (guid) => {
      // Search for the GUID in all loaded tables
      for (const table of tables) {
        const row = table.rows?.find(r => r.Id === guid);
        if (row) {
          // Find a name column
          const nameCol = table.columns.find(c => 
            c !== "Id" && (c.toLowerCase().includes("name") || c.toLowerCase().includes("title"))
          ) || table.columns.find(c => c !== "Id");
          
          const name = row[nameCol] ?? "Item";
          return `#${row.visualId} - ${name}`;
        }
      }
      // If not found, return shortened GUID
      return guid.substring(0, 8) + "...";
    });
  };

  const handleServiceError = (error) => {
    if (error.response?.data?.errors) {
      // Validation errors: { field: ["error1", "error2"] }
      const fieldErrors = {};
      Object.entries(error.response.data.errors).forEach(([key, msgs]) => {
        // Convert camelCase (backend) to PascalCase (frontend form)
        const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
        fieldErrors[fieldName] = humanizeErrorMessage(msgs[0]);
      });
      throw fieldErrors; // Throw to be caught by CreateForm
    } else {
      // Global error
      let msg = error.response?.data?.detail || error.response?.data?.title || error.message || "An unexpected error occurred";
      msg = humanizeErrorMessage(msg);
      setGlobalErrors(prev => [...prev, msg]);
    }
  };

  const handleCreateItem = async (data) => { 
    try {
      const srv = TABLE_SERVICES[selectedTable.name]; 
      const apiData = { ...data }; 
      Object.keys(apiData).forEach(k => { 
        const value = enumsValues[k]; 
        if (value) {
          console.log(`Converting ${k}: "${apiData[k]}" -> ${value[apiData[k]]}`);
          apiData[k] = value[apiData[k]]; 
        }
      
        if (apiData[k]?.isForeign) 
          apiData[k] = apiData[k].value; 
      }); 

      console.log("Final apiData to send:", JSON.stringify(apiData, null, 2));
      await srv.create(apiData); 
      const updated = await reloadTable(selectedTable.name); 
      setSelectedTable(updated); 
      setShowCreateForm(false); 
    } catch (error) {
      handleServiceError(error);
    }
  };

  const handleUpdateItem = async (data) => {
    try {
      const srv = TABLE_SERVICES[selectedTable.name];

      const apiData = { ...data };
      Object.keys(apiData).forEach(k => {
        if (apiData[k]?.isForeign) apiData[k] = apiData[k].value;
      });

      await srv.update(editingItem.Id, apiData);

      const updated = await reloadTable(selectedTable.name);
      setSelectedTable(updated);

      setShowCreateForm(false);
      setEditingItem(null);
    } catch (error) {
      handleServiceError(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar?")) return;
    try {
      const srv = TABLE_SERVICES[selectedTable.name];
      await srv.delete(id);

      const updated = await reloadTable(selectedTable.name);
      setSelectedTable(updated);
    } catch (error) {
      handleServiceError(error);
    }
  };

  // ============================
  // TRANSFER REQUEST ACTIONS
  // ============================
  const handleAcceptRequest = async (id) => {
    try {
      await dashboardService.TransferRequest.accept(id);
      const updated = await reloadTable("TransferRequests");
      setSelectedTable(updated);
      // Also reload Transfers table since a new one was created
      await reloadTable("Transfers");
    } catch (error) {
      handleServiceError(error);
    }
  };

  const handleDenyRequest = async (id) => {
    try {
      await dashboardService.TransferRequest.deny(id);
      const updated = await reloadTable("TransferRequests");
      setSelectedTable(updated);
    } catch (error) {
      handleServiceError(error);
    }
  };

  const handleCancelRequest = async (id) => {
    try {
      await dashboardService.TransferRequest.cancel(id);
      const updated = await reloadTable("TransferRequests");
      setSelectedTable(updated);
    } catch (error) {
      handleServiceError(error);
    }
  };

  // ============================
  // MAINTENANCE ACTIONS
  // ============================
  const handleCompleteMaintenance = async (id) => {
    try {
      await dashboardService.Maintenance.complete(id);
      const updated = await reloadTable("Maintenances");
      setSelectedTable(updated);
      // Also reload Equipments table since equipment state changed to Operative
      await reloadTable("Equipments");
    } catch (error) {
      handleServiceError(error);
    }
  };

  // ============================
  // EQUIPMENT DECOMMISSION ACTIONS
  // ============================
  const handleReleaseToWarehouse = async (decommissionId, targetDepartmentId, recipientId) => {
    try {
      await dashboardService.EquipmentDecommission.release(decommissionId, targetDepartmentId, recipientId);
      const updated = await reloadTable("EquipmentDecommissions");
      setSelectedTable(updated);
      // Also reload Equipments table since equipment state and location changed
      await reloadTable("Equipments");
    } catch (error) {
      handleServiceError(error);
    }
  };

  // ============================
  // 🔥 FILTRO (NUEVO: filtra en backend)
  // ============================
  const handleFilter = async (filters) => {
    if (!selectedTable) return;

    if (Object.keys(filters).length === 0) {
      setFilteredRows(null);
      return;
    }

    const convertToBackendField = (key) => {
      return key
        .split(".")
        .map((segment, index) => {
          if (index === 0 && segment.toLowerCase().endsWith("id")) {
            const base = segment.slice(0, -2);
            return base.charAt(0).toUpperCase() + base.slice(1);
          }
          return segment.charAt(0).toUpperCase() + segment.slice(1);
        })
        .join(".");
    };

    const backendFiltersPromises = Object.entries(filters).map(async ([key, value]) => {
      const safeValue = (value || "").trim();
      if (!safeValue) return null;

      if (!key.includes(".")) {
        const safeEscaped = safeValue.replace(/"/g, '\\"');
        const backendField = convertToBackendField(key);
        return `${backendField}.Contains("${safeEscaped}")`;
      }

      return await buildBackendFilter(key, safeValue);
    });

    const backendFilters = (await Promise.all(backendFiltersPromises)).filter(Boolean);

    try {
      const srv = TABLE_SERVICES[selectedTable.name];
      console.log("BackendFilters:", backendFilters);
      const response = await srv.filter(backendFilters);

      const filteredTable = transformToTableFormat(response, selectedTable.name);

      const resolved = resolveForeignKeysVisualIds(
        tables.map(t =>
          t.name === selectedTable.name ? filteredTable : t
        )
      );

      const updated = resolved.find(t => t.name === selectedTable.name);

      setFilteredRows(updated.rows);
      setCurrentPage(1);

    } catch (e) {
      console.error("Filter error:", e);
    }
  };

  // ============================
  // PAGINATION
  // ============================
  const rowsToDisplay = filteredRows || selectedTable?.rows || [];
  const totalPages = Math.max(1, Math.ceil(rowsToDisplay.length / pageSize));
  const paginated = rowsToDisplay.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const tableWithFilters =
    selectedTable
      ? {
          ...selectedTable,
          filteredRows: paginated,
          selectedRows,
          currentPage,
          totalPages,
          pageSize,
          rowsTotalCount: rowsToDisplay.length
        }
      : null;
  
  function logOut() {
    authService.logout();
    navigate("/");
  }

  // ============================
  // RENDER
  // ============================
  if (loading) return <div className="loading">Loading information…</div>;

  return (
    <div className={`dashboard-container: ${showCreateForm?'form-open' : ''}`}>
      <div className="body-dashboard">
        <div className="dashboard-bg">
          <div className="dashboard-header">
            <div className="dashboard-logo">
              Ges<span className="highlight">H</span>Tec<span className="highlight">K</span>
            </div>

            <div className="dashboard-user">
              <ThemeToggle />
              {roleConfig.canExportReports && (
              <div className="report-wrapper">
                <Button
                  variant="btn-report-toggle"
                  onClick={() => setReportOpen(o => !o)}
                  text="Reports"
                />

                <Panel
                  open={reportOpen}
                  onClose={() => setReportOpen(false)}
                  className="report-dropdown"
                  position="dropdown"
                  closeOnOutside={true}
                  closeOnEsc={true}
                >
                  <div className="report-field">
                    <label>Report Type</label>
                    <select
                      value={selectedReport}
                      onChange={(e) => {
                        setSelectedReport(e.target.value);
                        setReportFilter({ equipmentId: "", departmentId: "" });
                      }}
                    >
                      <option value="default">General Report</option>
                      <option value="equipmentDecommissionLastYear">1. Decommissioned Equipment</option>
                      <option value="equipmentMaintenanceHistory">2. Equipment History</option>
                      <option value="equipmentTransfers">3. Transferred Equipment</option>
                      <option value="technicianPerformanceCorrelation">4. Technician Performance</option>
                      <option value="frequentMaintenanceEquipment">5. Frequent Maintenance</option>
                      <option value="technicianPerformanceBonus">6. Technician Bonuses</option>
                      <option value="equipmentToDepartment">7. Equipment by Department</option>
                    </select>
                  </div>

                  {selectedReport === "equipmentMaintenanceHistory" && (
                    <div className="report-field">
                      <label>Equipment</label>
                      <select
                        value={reportFilter.equipmentId}
                        onChange={(e) =>
                          setReportFilter({ ...reportFilter, equipmentId: e.target.value })
                        }
                        className="report-select"
                      >
                        <option value="">Select Equipment</option>
                        {allEquipments.map((eq, idx) => (
                          <option key={eq.Id || eq.id} value={eq.Id || eq.id}>
                            #{idx + 1} - {eq.Name || eq.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedReport === "equipmentToDepartment" && (
                    <div className="report-field">
                      <label>Department</label>
                      <select
                        value={reportFilter.departmentId}
                        onChange={(e) =>
                          setReportFilter({ ...reportFilter, departmentId: e.target.value })
                        }
                        className="report-select"
                      >
                        <option value="">Select Department</option>
                        {allDepartments.map((dept, idx) => (
                          <option key={dept.Id || dept.id} value={dept.Id || dept.id}>
                            #{idx + 1} - {dept.Name || dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="report-field">
                    <label>Format</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="word">Word</option>
                    </select>
                  </div>

                  <Button
                    variant="btn-report-export"
                    onClick={handleExportReport}
                    text="Export Report"
                  />
                </Panel>
              </div>
              )}

              <div className="user-avatar">{authService.getUserInitial()}</div>
              <Button variant="btn-logout" onClick={logOut} text="Logout" />
            </div>
          </div>

          {/* ===================================== */}
          {/* TABLES SECTION AND SELECTOR */}
          {/* ===================================== */}
          <div className="dashboard-container">
            <TableSelector
              tables={tables}
              onSelect={handleSelectTable}
              activeTable={selectedTable?.name}
              isPanelOpen={showCreateForm}
            />

            {selectedTable ? (
              <TableViewer
                table={tableWithFilters}
                tables={tables}
                onForeignClick={handleForeignClick}
                onToggleRow={toggleRowSelection}
                onCreateClick={
                  roleConfig.canCreate && 
                  !TABLE_METADATA[selectedTable.name]?.viewOnly &&
                  !roleConfig.readOnlyTables?.includes(selectedTable.name)
                    ? toggleCreateForm 
                    : null
                }
                onEdit={
                  roleConfig.canEdit && 
                  !TABLE_METADATA[selectedTable.name]?.viewOnly &&
                  !roleConfig.readOnlyTables?.includes(selectedTable.name)
                    ? (item) => {
                        setEditingItem(item);
                        setShowCreateForm(true);
                      } 
                    : null
                }
                onDelete={
                  roleConfig.canDelete && 
                  !roleConfig.readOnlyTables?.includes(selectedTable.name)
                    ? handleDelete 
                    : null
                }
                onFilter={handleFilter}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                isPanelOpen={showCreateForm}
                hiddenColumns={getHiddenColumns(userRole, selectedTable?.name)}
                onAcceptRequest={handleAcceptRequest}
                onDenyRequest={handleDenyRequest}
                onCancelRequest={handleCancelRequest}
                onCompleteMaintenance={handleCompleteMaintenance}
                onReleaseDecommission={handleReleaseToWarehouse}
                currentUserId={user?.id || user?.Id}
                allDepartments={allDepartments}
                allEmployees={tables.find(t => t.name === "Employees")?.rows || []}
              />
            ) : (
              <p className="table-empty">Select a table to view</p>
            )}
          </div>
        </div>

        {/* ===================================== */}
        {/* CREATE FORM AS MODAL PANEL */}
        {/* ===================================== */}
        <Panel
          open={showCreateForm}
          onClose={() => {
            setShowCreateForm(false);
            setEditingItem(null);
          }}
          className="create-form-panel"
          position="right"
          portal={true}
          closeOnOutside={false}
          closeOnEsc={true}
        >
          <div className="panel-content">
            <CreateForm
              table={selectedTable}
              tables={tables}
              allDepartments={allDepartments}
              editingItem={editingItem}
              onClose={() => {
                setShowCreateForm(false);
                setEditingItem(null);
              }}
              onSave={editingItem ? handleUpdateItem : handleCreateItem}
            />
          </div>
        </Panel>

        <ErrorPanel 
          errors={globalErrors} 
          onClose={() => setGlobalErrors([])} 
        />
      </div> 
    </div>
  );
}

export default Dashboard;