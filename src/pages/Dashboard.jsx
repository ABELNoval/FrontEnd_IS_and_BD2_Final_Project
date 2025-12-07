// ========================
// Dashboard.jsx COMPLETO
// ========================
import React, { useState, useEffect } from "react";
import TableSelector from "../components/Dashboard/TableSelector.jsx";
import TableViewer from "../components/Dashboard/TablesViewer.jsx";
import CreateForm from "../components/Dashboard/CreateForm.jsx";
import { dashboardService } from "../services/dashboardService.js";
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
  Technicals: ["id", "name", "email", "password", "speciality", "experience"],
  Employees: ["id", "name", "email", "password", "departmentId"],
  Directors: ["id", "name", "email", "password"],
  Assessments: ["id", "technicalId", "directorId", "score", "comment", "assessmentDate"],
  Maintenances: ["id", "equipmentId", "technicalId", "maintenanceDate", "maintenanceType", "cost"],
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
  // 🔥 SOLUCIÓN: Resolver visualId de foreign keys
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


  // ================================
  // CREAR / UPDATE / DELETE
  // ================================
  const toggleCreateForm = () => {
    setShowCreateForm(prev => !prev);
    setEditingItem(null);
  };

  const enumsValues = {
    "state" : {"Operative": 1, "UnderMaintenance": 2, "Decommissioned" : 3, "Disposed" : 4},
    "mantinanceType": {"Preventive":1, "Corrective":2, "Predective":3, "Emergency":4},
    "destinyType" :{"Department":1, "Disposal":2, "Warehouse":3},
    "locationType" : {"Department":1, "Disposal":2, "Warehouse":3}
  }
  const handleCreateItem = async (data) => {
    const srv = TABLE_SERVICES[selectedTable.name];

    const apiData = { ...data };
    Object.keys(apiData).forEach(k => {
      const value = enumsValues[k];
      if (value) {
        apiData[k] = value[apiData[k]];
      }
      if (apiData[k]?.isForeign) apiData[k] = apiData[k].value;
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
