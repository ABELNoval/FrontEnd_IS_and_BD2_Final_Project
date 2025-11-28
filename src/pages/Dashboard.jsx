import React, { useState, useEffect } from "react";
import TableSelector from "../components/Dashboard/TableSelector.jsx";
import TableViewer from "../components/Dashboard/TablesViewer.jsx";
import CreateForm from "../components/Dashboard/CreateForm.jsx";
import data from "../data/dashboard.json";
import "./Dashboard.css";

function Dashboard() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filteredRows, setFilteredRows] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // tamaño por defecto


  useEffect(() => {
    setTables(data.tables || []);
  }, []);

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

  const handleCreateItem = (formData) => {
    if (!selectedTable) return;

    const maxId = selectedTable.rows.reduce((max, row) => 
      Math.max(max, typeof row.id === 'number' ? row.id : 0), 0);
    const newId = maxId + 1;

    const newItem = { id: newId };
    
    selectedTable.columns.forEach(column => {
      if (column !== 'id') {
        if (typeof formData[column] === 'object' && formData[column] !== null) {
          newItem[column] = formData[column];
        } else {
          newItem[column] = formData[column] || '';
        }
      }
    });

    setTables(prevTables => 
      prevTables.map(table => 
        table.name === selectedTable.name
          ? { ...table, rows: [...table.rows, newItem] }
          : table
      )
    );

    setSelectedTable(prev => 
      prev ? { ...prev, rows: [...prev.rows, newItem] } : null
    );

    setShowCreateForm(false);
    console.log("Nuevo elemento creado:", newItem);
  };

  // 🔄 NUEVA FUNCIÓN PARA ACTUALIZAR ELEMENTOS EXISTENTES
  const handleUpdateItem = (formData) => {
    if (!selectedTable || !editingItem) return;

    // Actualizar el elemento existente
    const updatedRows = selectedTable.rows.map(row => {
      if (row.id === editingItem.id) {
        const updatedItem = { id: editingItem.id };
        
        selectedTable.columns.forEach(column => {
          if (column !== 'id') {
            if (typeof formData[column] === 'object' && formData[column] !== null) {
              updatedItem[column] = formData[column];
            } else {
              updatedItem[column] = formData[column] || '';
            }
          }
        });
        
        return updatedItem;
      }
      return row;
    });

    setTables(prevTables => 
      prevTables.map(table => 
        table.name === selectedTable.name
          ? { ...table, rows: updatedRows }
          : table
      )
    );

    setSelectedTable(prev => 
      prev ? { ...prev, rows: updatedRows } : null
    );

    setShowCreateForm(false);
    setEditingItem(null);
    
    console.log("Elemento actualizado:", editingItem.id, formData);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowCreateForm(true);
  };

  const handleDelete = (itemId) => {
    if (!selectedTable) return;

    // Verificar si el elemento está siendo usado en otras tablas
    const usedInTables = [];
    tables.forEach(table => {
      if (table.name !== selectedTable.name) {
        table.rows.forEach(row => {
          Object.values(row).forEach(cell => {
            if (cell && typeof cell === 'object' && cell.isForeign && 
                cell.ref === selectedTable.name && cell.value === itemId) {
              if (!usedInTables.includes(table.name)) {
                usedInTables.push(table.name);
              }
            }
          });
        });
      }
    });

    if (usedInTables.length > 0) {
      const warningMessage = `Este elemento está siendo usado en las siguientes tablas: ${usedInTables.join(', ')}.\n\n¿Estás seguro de que quieres eliminarlo?`;
      if (!window.confirm(warningMessage)) {
        return;
      }
    } else {
      if (!window.confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
        return;
      }
    }

    // Eliminar el elemento
    const updatedRows = selectedTable.rows.filter(row => row.id !== itemId);

    setTables(prevTables => 
      prevTables.map(table => 
        table.name === selectedTable.name
          ? { ...table, rows: updatedRows }
          : table
      )
    );

    setSelectedTable(prev => 
      prev ? { ...prev, rows: updatedRows } : null
    );

    // Remover de la selección si estaba seleccionado
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      newSelection.delete(itemId);
      return newSelection;
    });

    // Actualizar filas filtradas si existen
    if (filteredRows) {
      setFilteredRows(filteredRows.filter(row => row.id !== itemId));
    }

    console.log("Elemento eliminado:", itemId);
  };

  const handleFilter = (filters) => {
    if (!selectedTable) return;

    if (Object.keys(filters).length === 0) {
      // Si no hay filtros, mostrar todas las filas
      setFilteredRows(null);
      return;
    }

    const filtered = selectedTable.rows.filter(row => {
      return Object.entries(filters).every(([column, filterValue]) => {
        if (!filterValue) return true;

        const cellValue = row[column];
        
        // Para foreign keys, buscamos tanto en el valor como en la referencia
        if (cellValue && typeof cellValue === 'object' && cellValue.isForeign) {
          const valueStr = String(cellValue.value);
          const refStr = cellValue.ref;
          return valueStr.toLowerCase().includes(filterValue.toLowerCase()) || 
                 refStr.toLowerCase().includes(filterValue.toLowerCase());
        }
        
        // Para valores normales
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


  // Asegurarnos de pasar las filas filtradas a la tabla
  const tableWithFilters = selectedTable ? {
    ...selectedTable,
    selectedRows,
    filteredRows: paginateRows(rowsToDisplay), // 🎯 aquí paginamos
    rowsTotalCount: rowsToDisplay.length,
    currentPage,
    totalPages,
    pageSize,
  } : null;


  return (
    <div className="body-dashboard">
      <h1 className="main-title-dashboard">
        <span className="brand-part-dashboard ges">Ges</span>
        <span className="brand-part-dashboard highlight">H</span>
        <span className="brand-part-dashboard tec">Tec</span>
        <span className="brand-part-dashboard highlight">K</span>
      </h1>

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
            onSave={editingItem ? handleUpdateItem : handleCreateItem} // ✅ Usa la función correcta según el modo
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;