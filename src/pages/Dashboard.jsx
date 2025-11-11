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

  useEffect(() => {
    setTables(data.tables || []);
  }, []);

  const handleSelectTable = (tableName) => {
    const foundTable = tables.find((t) => t.name === tableName);
    setSelectedTable(foundTable);
    setSelectedRows(new Set());
    setShowCreateForm(false);
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
  };

  const handleCreateItem = (formData) => {
    if (!selectedTable) return;

    // Crear un nuevo ID (máximo ID actual + 1)
    const maxId = selectedTable.rows.reduce((max, row) => 
      Math.max(max, typeof row.id === 'number' ? row.id : 0), 0);
    const newId = maxId + 1;

    // Crear el nuevo objeto con la estructura correcta
    const newItem = { id: newId };
    
    // Mapear los datos del formulario a la estructura de la tabla
    selectedTable.columns.forEach(column => {
      if (column !== 'id') {
        // Si el campo es un objeto (foreign key), lo mantenemos como objeto
        if (typeof formData[column] === 'object' && formData[column] !== null) {
          newItem[column] = formData[column];
        } else {
          // Para campos normales, asignamos el valor directamente
          newItem[column] = formData[column] || '';
        }
      }
    });

    // Actualizar el estado de las tablas
    setTables(prevTables => 
      prevTables.map(table => 
        table.name === selectedTable.name
          ? { ...table, rows: [...table.rows, newItem] }
          : table
      )
    );

    // Actualizar la tabla seleccionada
    setSelectedTable(prev => 
      prev ? { ...prev, rows: [...prev.rows, newItem] } : null
    );

    // Cerrar el formulario
    setShowCreateForm(false);
    
    console.log("Nuevo elemento creado:", newItem);
  };

  return (
    <div className="body-dashboard">
      <h1 className="main-title-dashboard">
        <span className="brand-part-dashboard ges">Ges</span>
        <span className="brand-part-dashboard highlight">H</span>
        <span className="brand-part-dashboard tec">Tec</span>
        <span className="brand-part-dashboard highlight">K</span>
      </h1>

      <div className="dashboard-container">
        <TableSelector tables={tables} onSelect={handleSelectTable} />

        {selectedTable ? (
          <TableViewer
            table={{
              ...selectedTable,
              selectedRows,
            }}
            onForeignClick={handleForeignClick}
            onToggleRow={toggleRowSelection}
            onCreateClick={toggleCreateForm}
          />
        ) : (
          <p className="table-empty">Selecciona una tabla para verla</p>
        )}

        {showCreateForm && selectedTable && (
          <CreateForm 
            table={selectedTable}
            tables={tables}
            onClose={() => setShowCreateForm(false)}
            onSave={handleCreateItem}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;