import React, { useState, useEffect } from "react";
import TableSelector from "../components/Dashboard/TableSelector.jsx";
import TableViewer from "../components/Dashboard/TablesViewer.jsx";
import CreateForm from "../components/Dashboard/CreateForm.jsx";
import { dashboardService } from "../services/DashboardService.js";
import "./Dashboard.css";

// Mapeo de nombres de tabla a servicios
const TABLE_SERVICES = {
  'Departments': {
    get: dashboardService.getDepartments,
    create: dashboardService.createDepartment,
    update: dashboardService.updateDepartment,
    delete: dashboardService.deleteDepartment
  },
  'Sections': {
    get: dashboardService.getSections,
    create: dashboardService.createSection,
    update: dashboardService.updateSection,
    delete: dashboardService.deleteSection
  },
  'Equipment': {
    get: dashboardService.getEquipment,
    create: dashboardService.createEquipment,
    update: dashboardService.updateEquipment,
    delete: dashboardService.deleteEquipment
  },
  'Responsibles': {
    get: dashboardService.getResponsibles,
    create: dashboardService.createResponsible,
    update: dashboardService.updateResponsible,
    delete: dashboardService.deleteResponsible
  },
  'EquipmentTypes': {
    get: dashboardService.getEquipmentTypes,
    create: dashboardService.createEquipmentType,
    update: dashboardService.updateEquipmentType,
    delete: dashboardService.deleteEquipmentType
  }
};

const DEFAULT_COLUMNS = {
  Departments: ["id", "name", "sectionId", "responsibleId"],
  Sections: ["id", "name"],
  Equipment: ["id", "name", "acquisitionDate", "equipmentTypeId", "departmentId", "state", "locationType"],
  Responsibles: ["id", "userId", "departmentId"],
  EquipmentTypes: ["id", "name", "equipmentCount"]
};


// Función para transformar datos de API a formato de tabla
const transformToTableFormat = (data, tableName) => {
  const defaultColumns = DEFAULT_COLUMNS[tableName] || [];

  if (!data || data.length === 0) {
    return {
      name: tableName,
      columns: defaultColumns,
      rows: []
    };
  }

  const columns = Object.keys(data[0]);
  
  return {
    name: tableName,
    columns: columns,
    rows: data.map(item => ({
      ...item,
      // Transformar foreign keys al formato que TableViewer entiende
      ...(item.departmentId && {
        departmentId: {
          isForeign: true,
          ref: 'Departments',
          value: item.departmentId
        }
      }),
      ...(item.equipmentTypeId && {
        equipmentTypeId: {
          isForeign: true,
          ref: 'EquipmentTypes',
          value: item.equipmentTypeId
        }
      }),
      ...(item.responsibleId && {
        responsibleId: {
          isForeign: true,
          ref: 'Responsibles',
          value: item.responsibleId
        }
      })
    }))
  };
};

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

  // Cargar datos de todas las tablas al montar el componente
  useEffect(() => {
    loadAllTables();
  }, []);

  const loadAllTables = async () => {
    setLoading(true);
    try {
      const tableNames = Object.keys(TABLE_SERVICES);
      const tablesData = await Promise.all(
        tableNames.map(async (tableName) => {
          try {
            const data = await TABLE_SERVICES[tableName].get();
            return transformToTableFormat(data, tableName);
          } catch (error) {
            console.error(`Error loading ${tableName}:`, error);
            return transformToTableFormat([], tableName);
          }
        })
      );
      
      setTables(tablesData.filter(table => table !== null));
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTable = (tableName) => {
    const foundTable = tables.find((t) => t.name === tableName);
    setSelectedTable(foundTable);
    setSelectedRows(new Set());
    setShowCreateForm(false);
    setEditingItem(null);
    setFilteredRows(null);
    setCurrentPage(1);
  };

  const handleForeignClick = (refTableName, targetId) => {
    const targetTable = tables.find((t) => t.name === refTableName);
    
    if (selectedTable?.name === refTableName) {
      toggleRowSelection(targetId);
    } else {
      setSelectedTable(targetTable);
      setTimeout(() => {
        setSelectedRows(new Set([targetId]));
      }, 0);
    }
    setShowCreateForm(false);
    setEditingItem(null);
  };

  const toggleRowSelection = (rowId) => {
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(rowId)) {
        newSelection.delete(rowId);
      } else {
        newSelection.add(rowId);
      }
      return newSelection;
    });
  };

  const toggleCreateForm = () => {
    setShowCreateForm(prev => !prev);
    setEditingItem(null);
  };

  // CREAR NUEVO ELEMENTO
  const handleCreateItem = async (formData) => {
    if (!selectedTable) return;

    try {
      const service = TABLE_SERVICES[selectedTable.name];
      if (!service) {
        console.error('No service found for table:', selectedTable.name);
        return;
      }

      // Preparar datos para la API
      const apiData = { ...formData };
      Object.keys(apiData).forEach(key => {
        if (apiData[key] && typeof apiData[key] === 'object' && apiData[key].isForeign) {
          apiData[key] = apiData[key].value;
        }
      });

      await service.create(apiData);
      
      // Recargar la tabla completa para obtener los datos actualizados
      await loadTableData(selectedTable.name);
      
      setShowCreateForm(false);
      console.log("✅ Elemento creado exitosamente");
    } catch (error) {
      console.error("❌ Error creando elemento:", error);
      alert('Error al crear el elemento: ' + (error.response?.data?.message || error.message));
    }
  };

  // ACTUALIZAR ELEMENTO
  const handleUpdateItem = async (formData) => {
    if (!selectedTable || !editingItem) return;

    try {
      const service = TABLE_SERVICES[selectedTable.name];
      if (!service) {
        console.error('No service found for table:', selectedTable.name);
        return;
      }

      // Preparar datos para la API
      const apiData = { ...formData };
      Object.keys(apiData).forEach(key => {
        if (apiData[key] && typeof apiData[key] === 'object' && apiData[key].isForeign) {
          apiData[key] = apiData[key].value;
        }
      });

      await service.update(editingItem.id, apiData);
      
      // Recargar la tabla completa
      await loadTableData(selectedTable.name);
      
      setShowCreateForm(false);
      setEditingItem(null);
      console.log("✅ Elemento actualizado exitosamente");
    } catch (error) {
      console.error("❌ Error actualizando elemento:", error);
      alert('Error al actualizar el elemento: ' + (error.response?.data?.message || error.message));
    }
  };

  // Cargar datos de una tabla específica
  const loadTableData = async (tableName) => {
    try {
      const service = TABLE_SERVICES[tableName];
      const data = await service.get();
      const transformedTable = transformToTableFormat(data, tableName);
      
      setTables(prev => 
        prev.map(table => 
          table.name === tableName ? transformedTable : table
        )
      );
      
      if (selectedTable?.name === tableName) {
        setSelectedTable(transformedTable);
      }
    } catch (error) {
      console.error(`Error reloading ${tableName}:`, error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowCreateForm(true);
  };

  // ELIMINAR ELEMENTO
  const handleDelete = async (itemId) => {
    if (!selectedTable) return;

    if (!window.confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
      return;
    }

    try {
      const service = TABLE_SERVICES[selectedTable.name];
      await service.delete(itemId);
      
      // Recargar la tabla completa
      await loadTableData(selectedTable.name);
      
      console.log("✅ Elemento eliminado:", itemId);
    } catch (error) {
      console.error("❌ Error eliminando elemento:", error);
      alert('Error al eliminar el elemento: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFilter = (filters) => {
    if (!selectedTable) return;

    if (Object.keys(filters).length === 0) {
      setFilteredRows(null);
      return;
    }

    const filtered = selectedTable.rows.filter(row => {
      return Object.entries(filters).every(([column, filterValue]) => {
        if (!filterValue) return true;

        const cellValue = row[column];
        
        if (cellValue && typeof cellValue === 'object' && cellValue.isForeign) {
          const valueStr = String(cellValue.value);
          const refStr = cellValue.ref;
          return valueStr.toLowerCase().includes(filterValue.toLowerCase()) || 
                 refStr.toLowerCase().includes(filterValue.toLowerCase());
        }
        
        const stringValue = String(cellValue || '').toLowerCase();
        return stringValue.includes(filterValue.toLowerCase());
      });
    });

    setCurrentPage(1);
    setFilteredRows(filtered);
  };

  const paginateRows = (rows) => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return rows.slice(start, end);  
  };

  const rowsToDisplay = filteredRows || selectedTable?.rows || [];
  const totalPages = Math.max(1, Math.ceil(rowsToDisplay.length / pageSize));

  const tableWithFilters = selectedTable ? {
    ...selectedTable,
    selectedRows,
    filteredRows: paginateRows(rowsToDisplay),
    rowsTotalCount: rowsToDisplay.length,
    currentPage,
    totalPages,
    pageSize,
  } : null;

  if (loading) {
    return <div className="loading">Cargando datos...</div>;
  }

  return (
    <div className="body-dashboard">
      <div className="dashboard-header">
        <h1 className="main-title-dashboard">
          <span className="brand-part-dashboard ges">Ges</span>
          <span className="brand-part-dashboard highlight">H</span>
          <span className="brand-part-dashboard tec">Tec</span>
          <span className="brand-part-dashboard highlight">K</span>
        </h1>
        {/* Sin información de usuario ni logout */}
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
            onForeignClick={handleForeignClick}
            onToggleRow={toggleRowSelection}
            onCreateClick={toggleCreateForm}
            onEdit={handleEdit}
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

        {showCreateForm && selectedTable && (
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