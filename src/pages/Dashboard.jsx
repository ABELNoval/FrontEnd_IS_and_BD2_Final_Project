import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import TableSelector from "../components/Dashboard/TableSelector.jsx";
import TableViewer from "../components/Dashboard/TablesViewer.jsx";
import CreateForm from "../components/Dashboard/CreateForm.jsx";
import Panel from "../components/Panel/Panel.jsx";
import Button from "../components/Button/Button.jsx";
import Input from "../components/Input/Input.jsx";
import { reportService, dashboardService } from "../services/dashboardService.js";
import { downloadBlob } from "../utils/download.js";
import "../styles/pages/Dashboard.css";

// =====================================
// 1) TODOS LOS SERVICIOS DE TODAS LAS TABLAS
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
  EquipmentDecommissions: dashboardService.EquipmentDecommission
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
  EquipmentDecommissions: ["Id", "EquipmentId", "TechnicalId", "DepartmentId", "RecipientId", "DestinyTypeId", "DecommissionDate", "Reason"]
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
  "EquipmentDecommissions"
];

const enumsValues = {
  "StateId" : {"Operative": 1, "UnderMaintenance": 2, "Decommissioned" : 3, "Disposed" : 4},
  "MaintenanceTypeId": {"Preventive":1, "Corrective":2, "Predective":3, "Emergency":4},
  "DestinyTypeId" :{"Department":1, "Disposal":2, "Warehouse":3},
  "LocationTypeId" : {"Department":1, "Disposal":2, "Warehouse":3}
};

// =====================================
// TRANSFORMAR FORMATO DE TABLAS
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
      // Detección dinámica de foreign keys
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
  const navigate = useNavigate();

  // =====================================
  // Tipo de reporte seleccionado
  // =====================================
  const [selectedReport, setSelectedReport] = useState("default");

  // =====================================
  // Filtros específicos para reportes
  // =====================================
  const [reportFilter, setReportFilter] = useState({
    equipmentId: "",    
    departmentId: "" 
  });

  // =====================================
  // CARGAR TODAS LAS TABLAS
  // =====================================
  useEffect(() => {
    loadAllTables();
  }, []);

  const loadAllTables = async () => {
    setLoading(true);

    try {
      const tableNames = Object.keys(TABLE_SERVICES);

      const data = await Promise.all(tableNames.map(async (table) => {
        const result = await TABLE_SERVICES[table].get().catch(() => []);
        return transformToTableFormat(result, table);
      }));

      // una vez cargadas → resolvemos visualId de FK
      const resolved = resolveForeignKeysVisualIds(data);
      setTables(resolved);

    } catch (err) {
      console.error("Load error:", err);
    }

    setLoading(false);
  };

  // ====================================================
  // RECARGAR TODAS LAS TABLAS
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

      // ⚡ devolver al Dashboard la tabla actualizada
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
  // Construir filtro para backend cuando es FK (p. ej. departmentId.name)
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
  // SELECCIÓN DE FILA
  // ================================
  const toggleRowSelection = (id) => {
    setSelectedRows(prev => {
      const set = new Set(prev);
      set.has(id) ? set.delete(id) : set.add(id);
      return set;
    });
  };

  // =====================================
  // 🆕 FUNCIÓN AUXILIAR: Generar nombres de archivo
  // =====================================
  const generateFileName = (reportType, format) => {
    const reportNames = {
      default: "reporte-general",
      equipmentDecommissionLastYear: "equipos-dados-de-baja",
      equipmentMaintenanceHistory: `historial-mantenimiento-${reportFilter.equipmentId || "equipo"}`,
      equipmentTransfers: "equipos-trasladados",
      technicianPerformanceCorrelation: "correlacion-rendimiento-tecnicos",
      frequentMaintenanceEquipment: "equipos-mantenimiento-frecuente",
      technicianPerformanceBonus: "rendimiento-tecnicos-bonificaciones",
      equipmentToDepartment: `equipos-departamento-${reportFilter.departmentId || "departamento"}`
    };
    
    const extensions = {
      pdf: "pdf",
      excel: "xlsx",
      word: "docx"
    };
    
    const baseName = reportNames[reportType] || "reporte";
    const extension = extensions[format] || "pdf";
    const today = new Date().toISOString().split('T')[0];
    
    return `${baseName}-${today}.${extension}`;
  };

  // ================================
  // 🔄 FUNCIÓN COMPLETAMENTE REESCRITA: EXPORTAR REPORTE
  // ================================
  const handleExportReport = async () => {
    try {
      let response;
      
      if (selectedReport === "equipmentMaintenanceHistory" && !reportFilter.equipmentId.trim()) {
        alert("⚠️ Por favor ingresa el ID del equipo para el historial de mantenimiento");
        return;
      }
      
      if (selectedReport === "equipmentToDepartment" && !reportFilter.departmentId.trim()) {
        alert("⚠️ Por favor ingresa el ID del departamento");
        return;
      }

      switch (selectedReport) {
        case "equipmentDecommissionLastYear":
          console.log("📋 Exportando reporte 1: Equipos dados de baja (último año)");
          response = await reportService.exportEquipmentDecommissionLastYear(exportFormat);
          break;
          
        case "equipmentMaintenanceHistory":
          console.log(`🔧 Exportando reporte 2: Historial del equipo ${reportFilter.equipmentId}`);
          response = await reportService.exportEquipmentMaintenanceHistory(
            reportFilter.equipmentId, 
            exportFormat
          );
          break;
          
        case "equipmentTransfers":
          console.log("🚚 Exportando reporte 3: Equipos trasladados entre secciones");
          response = await reportService.exportEquipmentTransfersBetweenSections(exportFormat);
          break;
          
        case "technicianPerformanceCorrelation":
          console.log("📈 Exportando reporte 4: Correlación rendimiento técnicos");
          response = await reportService.exportTechnicianCorrelationWorst(exportFormat);
          break;
          
        case "frequentMaintenanceEquipment":
          console.log("⚠️ Exportando reporte 5: Equipos con 3+ mantenimientos");
          response = await reportService.exportFrequentMaintenanceEquipment(exportFormat);
          break;
          
        case "technicianPerformanceBonus":
          console.log("💰 Exportando reporte 6: Rendimiento técnicos para bonificaciones");
          response = await reportService.exportTechnicianPreformanceBonus(exportFormat);
          break;
          
        case "equipmentToDepartment":
          console.log(`📦 Exportando reporte 7: Equipos al departamento ${reportFilter.departmentId}`);
          response = await reportService.exportEquipmentSentToDepartment(
            reportFilter.departmentId, 
            exportFormat
          );
          break;
          
        default:
          console.log("Exportando reporte general de la tabla actual");
          response = await reportService.export(exportFormat);
          break;
      }

      const fileName = generateFileName(selectedReport, exportFormat);
      downloadBlob(response, fileName);
      alert(`Reporte generado: ${fileName}`);
      setReportOpen(false);
      
    } catch (e) {
      console.error("❌ Error exportando reporte:", e);
      alert("❌ Error al generar el reporte. Verifica que el backend esté funcionando.");
    }
  };

  // ================================
  // CREAR / UPDATE / DELETE
  // ================================
  const toggleCreateForm = () => {
    setShowCreateForm(prev => !prev);
    setEditingItem(null);
  };

  const handleCreateItem = async (data) => { 
    const srv = TABLE_SERVICES[selectedTable.name]; 
    const apiData = { ...data }; 
    Object.keys(apiData).forEach(k => { 
      const value = enumsValues[k]; 
      if (value) {
        apiData[k] = value[apiData[k]]; 
      }
    
      if (apiData[k]?.isForeign) 
        apiData[k] = apiData[k].value; 
    }); 

    await srv.create(apiData); 
    const updated = await reloadTable(selectedTable.name); 
    setSelectedTable(updated); 
    setShowCreateForm(false); 
  };

  const handleUpdateItem = async (data) => {
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar?")) return;
    const srv = TABLE_SERVICES[selectedTable.name];
    await srv.delete(id);

    const updated = await reloadTable(selectedTable.name);
    setSelectedTable(updated);
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
  // PAGINACIÓN
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
                    <label>Tipo de Reporte</label>
                    <select
                      value={selectedReport}
                      onChange={(e) => {
                        setSelectedReport(e.target.value);
                        setReportFilter({ equipmentId: "", departmentId: "" });
                      }}
                    >
                      <option value="default">Reporte General</option>
                      <option value="equipmentDecommissionLastYear">1. Equipos dados de baja</option>
                      <option value="equipmentMaintenanceHistory">2. Historial por equipo</option>
                      <option value="equipmentTransfers">3. Equipos trasladados</option>
                      <option value="technicianPerformanceCorrelation">4. Rendimiento técnicos</option>
                      <option value="frequentMaintenanceEquipment">5. Mantenimientos frecuentes</option>
                      <option value="technicianPerformanceBonus">6. Bonificaciones técnicos</option>
                      <option value="equipmentToDepartment">7. Equipos por departamento</option>
                    </select>
                  </div>

                  {selectedReport === "equipmentMaintenanceHistory" && (
                    <div className="report-field">
                      <label>ID Equipo</label>
                      <Input
                        value={reportFilter.equipmentId}
                        onChange={(val) =>
                          setReportFilter({ ...reportFilter, equipmentId: val })
                        }
                        variant="input-report"
                        placeholder="Ingrese ID del equipo"
                      />
                    </div>
                  )}

                  {selectedReport === "equipmentToDepartment" && (
                    <div className="report-field">
                      <label>ID Departamento</label>
                      <Input
                        value={reportFilter.departmentId}
                        onChange={(val) =>
                          setReportFilter({ ...reportFilter, departmentId: val })
                        }
                        variant="input-report"
                        placeholder="Ingrese ID del departamento"
                      />
                    </div>
                  )}

                  <div className="report-field">
                    <label>Formato</label>
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
                    text="Exportar Reporte"
                  />
                </Panel>
              </div>

              <div className="user-avatar">A</div>
              <Button variant="btn-logout" onClick={logOut} text="Logout" />
            </div>
          </div>

          {/* ===================================== */}
          {/* SECCIÓN DE TABLAS Y SELECTOR */}
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
                onCreateClick={toggleCreateForm}
                onEdit={(item) => {
                  setEditingItem(item);
                  setShowCreateForm(true);
                }}
                onDelete={handleDelete}
                onFilter={handleFilter}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                isPanelOpen={showCreateForm}
              />
            ) : (
              <p className="table-empty">Selecciona una tabla para verla</p>
            )}
          </div>
        </div>

        {/* ===================================== */}
        {/* CREATE FORM COMO PANEL MODAL */}
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
              editingItem={editingItem}
              onClose={() => {
                setShowCreateForm(false);
                setEditingItem(null);
              }}
              onSave={editingItem ? handleUpdateItem : handleCreateItem}
            />
          </div>
        </Panel>
      </div> 
    </div>
  );
}

export default Dashboard;