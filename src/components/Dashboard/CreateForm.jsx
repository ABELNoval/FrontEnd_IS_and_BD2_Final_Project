import React, { useState } from "react";
import Input from "../Input/Input";
import Button from "../Button/Button";
import "./CreateForm.css";

function CreateForm({ table, tables, onClose, onSave }) { // 👈 Recibimos todas las tablas
  const columns = table.columns.filter(col => col !== "id");
  const [formData, setFormData] = useState({});

  // 👇 Función para detectar si una columna es foreign key
  const isForeignKey = (column) => {
    // Buscamos en las filas existentes si esta columna tiene objetos foreign key
    const hasForeignKey = table.rows.some(row => 
      row[column] && typeof row[column] === 'object' && row[column].isForeign
    );
    return hasForeignKey;
  };

  // 👇 Función para obtener la tabla referenciada por una foreign key
  const getReferencedTable = (column) => {
    // Buscamos la primera fila que tenga esta foreign key para obtener la referencia
    const rowWithForeignKey = table.rows.find(row => 
      row[column] && typeof row[column] === 'object' && row[column].isForeign
    );
    return rowWithForeignKey ? rowWithForeignKey[column].ref : null;
  };

  // 👇 Función para obtener las opciones de una tabla referenciada
  const getOptionsForTable = (tableName) => {
    const refTable = tables.find(t => t.name === tableName);
    if (!refTable) return [];
    
    // Mostramos el primer campo que no sea 'id' como etiqueta
    const labelColumn = refTable.columns.find(col => col !== 'id') || 'id';
    return refTable.rows.map(row => ({
      value: row.id,
      label: row[labelColumn] || `ID: ${row.id}`
    }));
  };

  const handleInputChange = (column, value) => {
    setFormData(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleSubmit = () => {
    // Validar que todos los campos requeridos estén llenos
    const requiredColumns = columns;
    const isEmpty = requiredColumns.some(col => {
      const value = formData[col];
      // Para foreign keys, el valor debe ser un número (el ID seleccionado)
      if (isForeignKey(col)) {
        return !value || value === '';
      }
      // Para campos normales, validamos que no esté vacío
      return !value || value.trim() === '';
    });
    
    if (isEmpty) {
      alert("Por favor, completa todos los campos");
      return;
    }
    
    // Para foreign keys, convertimos el valor a objeto foreign key
    const processedData = { ...formData };
    columns.forEach(col => {
      if (isForeignKey(col)) {
        const refTable = getReferencedTable(col);
        processedData[col] = {
          value: parseInt(processedData[col]),
          isForeign: true,
          ref: refTable
        };
      }
    });
    
    onSave(processedData);
  };

  return (
    <div className="create-form-container">
      <h3>Create new {table.name.slice(0, -1)}</h3>
      <div className="create-form">
        {columns.map(column => {
          if (isForeignKey(column)) {
            const refTable = getReferencedTable(column);
            const options = getOptionsForTable(refTable);
            
            return (
              <div key={column} className="form-field">
                <label>{column}:</label>
                <select
                  value={formData[column] || ''}
                  onChange={(e) => handleInputChange(column, e.target.value)}
                  className="form-select"
                >
                  <option value="">Select {refTable}</option>
                  {options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div key={column} className="form-field">
              <label>{column}:</label>
              <Input
                type="text"
                value={formData[column] || ""}
                placeholder={`Enter ${column}`}
                onChange={(value) => handleInputChange(column, value)}
              />
            </div>
          );
        })}
      </div>
      <div className="form-actions">
        <Button 
          text="Cancel" 
          onClick={onClose}
          variant="cancel-button"
        />
        <Button 
          text="Save" 
          onClick={handleSubmit}
          variant="save-button"
        />
      </div>
    </div>
  );
}

export default CreateForm;