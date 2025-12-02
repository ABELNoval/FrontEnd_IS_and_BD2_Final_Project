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
  Equipment: dashboardService.Equipment,
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
  Departments: ["id", "name", "sectionId", "responsibleId"],
  Sections: ["id", "name"],
  Equipment: ["id", "name", "acquisitionDate", "equipmentTypeId", "departmentId", "state", "locationType"],
  Responsibles: ["id", "name", "email", "departmentId"],
  EquipmentTypes: ["id", "name", "equipmentCount"],
  Technicals: ["id", "name", "email", "speciality", "experience"],
  Employees: ["id", "name", "email", "departmentID"],
  Directors: ["id", "name", "email"],
  Assessments: ["id", "technicalId", "directorId", "score", "comment", "assessmentDate"],
  Maintenances: ["id", "equipmentId", "technicalId", "maintenanceDate", "maintenanceType", "cost"],
  Transfers: ["id", "equipmentId", "sourceDepartmentId", "targetDepartmentId", "responsibleId", "transferDate"],
  EquipmentDecommissions: ["id", "equipmentId", "technicalId", "departmentId", "destinyTypeId", "decommissionDate", "reason"]
};

const allTableNames = [
  "Departments",
  "EquipmentTypes",
  "Responsibles",
  "Employee",
  "Director",
  "Technical",
  "Sections",
  "Equipment",
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
          const refTable = key.replace("Id", "");

          if (allTableNames.includes(refTable)) {
            row[key] = {
              isForeign: true,
              ref: refTable,
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

  const handleCreateItem = async (data) => {
    const srv = TABLE_SERVICES[selectedTable.name];

    const apiData = { ...data };
    Object.keys(apiData).forEach(k => {
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
  // FILTRO
  // ============================
  const handleFilter = (filters) => {
    if (!selectedTable) return;

    if (Object.keys(filters).length === 0) {
      setFilteredRows(null);
      return;
    }

    const filtered = selectedTable.rows.filter(row =>
      Object.entries(filters).every(([col, value]) => {
        if (!value) return true;
        const cell = row[col];
        if (cell?.isForeign) {
          return (
            String(cell.value).includes(value) ||
            String(cell.visual).includes(value)
          );
        }
        return String(cell ?? "").toLowerCase().includes(value.toLowerCase());
      })
    );

    setFilteredRows(filtered);
    setCurrentPage(1);
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
  if (loading) return <div className="loading">Cargando datos…</div>;

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
