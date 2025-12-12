import React, { useState, useEffect } from "react";
import TableSelector from "../components/Dashboard/TableSelector.jsx";
import TableViewer from "../components/Dashboard/TablesViewer.jsx";
import CreateForm from "../components/Dashboard/CreateForm.jsx";
import { reportService, dashboardService } from "../services/dashboardService.js";
import { downloadBlob } from "../utils/download.js";
import "./Dashboard.css";

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
// COLUMNAS DEFAULT CORRECTAS
// =====================================
const DEFAULT_COLUMNS = {
  Departments: ["id", "name", "sectionId"],
  Sections: ["id", "name", "responsibleId"],
  Equipments: ["id", "name", "acquisitionDate", "equipmentTypeId", "departmentId", "state", "locationType"],
  Responsibles: ["id", "name", "email", "password", "departmentId"],
  EquipmentTypes: ["id", "name"],
  Technicals: ["id", "name", "email", "password", "specialty", "experience"],
  Employees: ["id", "name", "email", "password", "departmentId"],
  Directors: ["id", "name", "email", "password"],
  Assessments: ["id", "technicalId", "directorId", "score", "comment", "assessmentDate"],
  Maintenances: ["id", "equipmentId", "technicalId", "maintenanceDate", "maintenanceTypeId", "cost"],
  Transfers: ["id", "equipmentId", "sourceDepartmentId", "targetDepartmentId", "responsibleId", "transferDate"],
  EquipmentDecommissions: ["id", "equipmentId", "technicalId", "departmentId", "destinyTypeId", "decommissionDate", "reason"]
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
  "state" : {"Operative": 1, "UnderMaintenance": 2, "Decommissioned" : 3, "Disposed" : 4},
  "maintenanceTypeId": {"Preventive":1, "Corrective":2, "Predective":3, "Emergency":4},
  "destinyTypeId" :{"Department":1, "Disposal":2, "Warehouse":3},
  "locationTypeId" : {"Department":1, "Disposal":2, "Warehouse":3}
}



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
          if (key.startsWith("source") || key.startsWith("target")) { refTable = "department";} 
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

  // =====================================
  // 🆕 NUEVO ESTADO 1: Tipo de reporte seleccionado
  // =====================================
  // Este estado guarda cuál de los 7 reportes eligió el usuario
  // "default" = reporte general de la tabla actual
  const [selectedReport, setSelectedReport] = useState("default");

  // =====================================
  // 🆕 NUEVO ESTADO 2: Filtros específicos para reportes
  // =====================================
  // Algunos reportes necesitan datos adicionales:
  // - Reporte #2: Necesita ID del equipo para ver su historial
  // - Reporte #7: Necesita ID del departamento para ver qué equipos llegaron
  const [reportFilter, setReportFilter] = useState({
    equipmentId: "",    // Para el reporte #2
    departmentId: ""    // Para el reporte #7
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
            const refRow = refTable?.rows.find(r => r.id === cell.value);
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
      const ids = matches.map((r) => r && r.id).filter(Boolean);
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
  // Esta función crea nombres descriptivos para los archivos descargados
  // Ejemplo: "equipos-dados-de-baja-2024-01-15.pdf"
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
    const today = new Date().toISOString().split('T')[0]; // Fecha en formato YYYY-MM-DD
    
    return `${baseName}-${today}.${extension}`;
  };

  // ================================
  // 🔄 FUNCIÓN COMPLETAMENTE REESCRITA: EXPORTAR REPORTE
  // ================================
  // IMPORTANTE: Esta función reemplaza la versión anterior
  // Ahora maneja 8 casos diferentes (7 reportes especiales + 1 general)
  const handleExportReport = async () => {
    try {
      let response;
      
      // 🛡️ VALIDACIÓN 1: Reporte #2 necesita ID de equipo
      if (selectedReport === "equipmentMaintenanceHistory" && !reportFilter.equipmentId.trim()) {
        alert("⚠️ Por favor ingresa el ID del equipo para el historial de mantenimiento");
        return;
      }
      
      // 🛡️ VALIDACIÓN 2: Reporte #7 necesita ID de departamento
      if (selectedReport === "equipmentToDepartment" && !reportFilter.departmentId.trim()) {
        alert("⚠️ Por favor ingresa el ID del departamento");
        return;
      }

      // 🎯 DECISIÓN: ¿Cuál de los 8 reportes vamos a generar?
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
          response = await reportService.equipmentTransfers(exportFormat);
          break;
          
        case "technicianPerformanceCorrelation":
          console.log("📈 Exportando reporte 4: Correlación rendimiento técnicos");
          response = await reportService.technicianPerformanceCorrelation(exportFormat);
          break;
          
        case "frequentMaintenanceEquipment":
          console.log("⚠️ Exportando reporte 5: Equipos con 3+ mantenimientos");
          response = await reportService.exportFrequentMaintenanceEquipment(exportFormat);
          break;
          
        case "technicianPerformanceBonus":
          console.log("💰 Exportando reporte 6: Rendimiento técnicos para bonificaciones");
          response = await reportService.exportTechnicianPerformanceBonus(exportFormat);
          break;
          
        case "equipmentToDepartment":
          console.log(`📦 Exportando reporte 7: Equipos al departamento ${reportFilter.departmentId}`);
          response = await reportService.equipmentToDepartment(
            reportFilter.departmentId, 
            exportFormat
          );
          break;
          
        default:
          // 📊 Reporte general (tabla actual filtrada) - MANTIENE LA FUNCIONALIDAD ORIGINAL
          console.log("📄 Exportando reporte general de la tabla actual");
          response = await reportService.export(exportFormat);
          break;
      }

      // 📝 Generar nombre del archivo con fecha
      const fileName = generateFileName(selectedReport, exportFormat);
      
      // ⬇️ Descargar el archivo (usa la función downloadBlob que ya tenías)
      downloadBlob(response, fileName);
      
      // ✅ Mensaje de confirmación
      alert(`✅ Reporte generado: ${fileName}`);
      
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
    Object.keys(apiData).forEach(k => { const value = enumsValues[k]; 
      if (value)
        apiData[k] = value[apiData[k]]; 
    
      if (apiData[k]?.isForeign) 
        apiData[k] = apiData[k].value; 
    }); 

    await srv.create(apiData); 
    const updated = await reloadTable(selectedTable.name); 
    setSelectedTable(updated); setShowCreateForm(false); 
  };

  const handleUpdateItem = async (data) => {
    const srv = TABLE_SERVICES[selectedTable.name];

    const apiData = { ...data };
    Object.keys(apiData).forEach(k => {
      if (apiData[k]?.isForeign) apiData[k] = apiData[k].value;
    });

    await srv.update(editingItem.id, apiData);

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

    // Si no hay filtros → reset
    if (Object.keys(filters).length === 0) {
      setFilteredRows(null);
      return;
    }

    // Convierte "departmentId.name" → "Department.Name"
    const convertToBackendField = (key) => {
      return key
        .split(".")
        .map((segment, index) => {

          // Primer segmento: detectar FK tipo "departmentId"
          if (index === 0 && segment.toLowerCase().endsWith("id")) {
            const base = segment.slice(0, -2); // remove "Id"
            return base.charAt(0).toUpperCase() + base.slice(1);
          }

          // Cualquier propiedad → PascalCase
          return segment.charAt(0).toUpperCase() + segment.slice(1);
        })
        .join(".");
    };

    // Construimos filtros: para claves normales usamos Contains, para FKs usamos buildBackendFilter
    const backendFiltersPromises = Object.entries(filters).map(async ([key, value]) => {
      const safeValue = (value || "").trim();
      if (!safeValue) return null;

      if (!key.includes(".")) {
        const safeEscaped = safeValue.replace(/"/g, '\\"');
        const backendField = convertToBackendField(key);
        return `${backendField}.Contains("${safeEscaped}")`;
      }

      // caso FK: p.ej. departmentId.name → resolver IDs y devolver comparaciones por Id
      return await buildBackendFilter(key, safeValue);
    });

    const backendFilters = (await Promise.all(backendFiltersPromises)).filter(Boolean);


    try {
      const srv = TABLE_SERVICES[selectedTable.name];
      console.log("BackendFilters:", backendFilters);
      // 🚀 NUEVA ruta en back: POST /{table}/filter
      const response = await srv.filter(backendFilters);

      // Convertimos al formato con visualId
      const filteredTable = transformToTableFormat(response, selectedTable.name);

      // Resolver FK visualId
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


  // ============================
  // RENDER
  // ============================
  if (loading) return <div className="loading">Loading information…</div>;

  return (
    <div className="body-dashboard">
      <div className="dashboard-header">
        <h1 className="main-title-dashboard">
          <span className="brand-part-dashboard ges">Ges</span>
          <span className="brand-part-dashboard highlight">H</span>
          <span className="brand-part-dashboard tec">Tec</span>
          <span className="brand-part-dashboard highlight">K</span>
        </h1>
      </div>

      {/* ===================================== */}
      {/* 🆕 SECCIÓN COMPLETAMENTE REESCRITA: CONTROLES DE EXPORTACIÓN */}
      {/* ===================================== */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "15px", 
        flexWrap: "wrap",
        alignItems: "center",
        padding: "15px",
        backgroundColor: "#1276daff",
        borderRadius: "8px",
        // border: "1px solid #dee2e6"
      }}>
        {/* SELECTOR DE TIPO DE REPORTE */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "12px", marginBottom: "4px", fontWeight: "bold", color: "#dbedffff" }}>
            Tipo de Reporte:
          </label>
          <select
            value={selectedReport}
            onChange={(e) => {
              // Cuando cambia el reporte, reseteamos los filtros
              setSelectedReport(e.target.value);
              setReportFilter({ equipmentId: "", departmentId: "" });
            }}
            style={{ 
              padding: "8px 12px", 
              minWidth: "300px",
              borderRadius: "4px",
              border: "1px solid #256badff",
              fontSize: "14px"
            }}
          >
            <option value="default"> Reporte General (tabla actual)</option>
            <option value="equipmentDecommissionLastYear">1. Equipos dados de baja (último año)</option>
            <option value="equipmentMaintenanceHistory">2. Historial mantenimiento por equipo</option>
            <option value="equipmentTransfers">3. Equipos trasladados entre secciones</option>
            <option value="technicianPerformanceCorrelation">4. Correlación rendimiento técnicos</option>
            <option value="frequentMaintenanceEquipment">5. Equipos con 3+ mantenimientos</option>
            <option value="technicianPerformanceBonus">6. Rendimiento técnicos (bonificaciones)</option>
            <option value="equipmentToDepartment">7. Equipos enviados a departamento</option>
          </select>
        </div>

        {/* CAMPOS DE FILTRO ESPECÍFICOS - SOLO APARECEN CUANDO SE NECESITAN */}
        {selectedReport === "equipmentMaintenanceHistory" && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "12px", marginBottom: "4px", fontWeight: "bold", color: "#c1d7ecff" }}>
              ID del Equipo:
            </label>
            <input
              type="text"
              placeholder="Ej: EQ-001 o el ID real del equipo"
              value={reportFilter.equipmentId}
              onChange={(e) => setReportFilter({...reportFilter, equipmentId: e.target.value})}
              style={{ 
                padding: "8px 12px", 
                width: "180px",
                borderRadius: "4px",
                border: "1px solid #01376dff",
                fontSize: "14px"
              }}
            />
          </div>
        )}

        {selectedReport === "equipmentToDepartment" && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "12px", marginBottom: "4px", fontWeight: "bold", color: "#abcef0ff" }}>
              ID del Departamento:
            </label>
            <input
              type="text"
              placeholder="Ej: DEP-001 o el ID real"
              value={reportFilter.departmentId}
              onChange={(e) => setReportFilter({...reportFilter, departmentId: e.target.value})}
              style={{ 
                padding: "8px 12px", 
                width: "180px",
                borderRadius: "4px",
                border: "1px solid #ced4da",
                fontSize: "14px"
              }}
            />
          </div>
        )}

        {/* SELECTOR DE FORMATO (MANTENIDO PERO MEJORADO) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "12px", marginBottom: "4px", fontWeight: "bold", color: "#b6cde3ff" }}>
            Formato de Salida:
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={{ 
              padding: "8px 12px", 
              borderRadius: "4px",
              border: "1px solid #ced4da",
              fontSize: "14px",
              minWidth: "120px"
            }}
          >
            <option value="pdf">📄 PDF (para imprimir)</option>
            <option value="excel">📊 Excel (para analizar)</option>
            <option value="word">📝 Word (para documentos)</option>
          </select>
        </div>
        
        {/* BOTÓN DE EXPORTAR (MANTENIDO PERO MEJORADO) */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
          <button
            onClick={handleExportReport}
            style={{ 
              padding: "10px 20px", 
              cursor: "pointer",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "background-color 0.3s",
              height: "40px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
          >
            <span>⬇️</span>
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* ===================================== */}
      {/* SECCIÓN ORIGINAL MANTENIDA: TABLAS Y SELECTOR */}
      {/* ===================================== */}
      <div className="dashboard-container">
        <TableSelector
          tables={tables}
          onSelect={handleSelectTable}
          activeTable={selectedTable?.name}
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
          />
        ) : (
          <p className="table-empty">Selecciona una tabla para verla</p>
        )}

        {showCreateForm && (
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
        )}
      </div>
    </div>
  );
}

export default Dashboard;