import React, { useState, useEffect } from "react";
import Input from "../Input/Input";
import Button from "../Button/Button";
import "./CreateForm.css";

function CreateForm({ table, tables, onClose, onSave, editingItem }) {
  const columns = table.columns.filter(col => col !== "id");
  const [formData, setFormData] = useState({});

  // Cargar datos del elemento si estamos editando
  useEffect(() => {
    if (editingItem) {
      const initialData = {};
      columns.forEach(column => {
        const value = editingItem[column];
        if (value && typeof value === 'object' && value.isForeign) {
          // Para foreign keys, usamos el valor numérico
          initialData[column] = value.value.toString();
        } else {
          initialData[column] = value || '';
        }
      });
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [editingItem, columns]);

  // ... (resto del código permanece igual)
  const isForeignKey = (column) => {
    const hasForeignKey = table.rows.some(row => 
      row[column] && typeof row[column] === 'object' && row[column].isForeign
    );
    return hasForeignKey;
  };

  const getReferencedTable = (column) => {
    const rowWithForeignKey = table.rows.find(row => 
      row[column] && typeof row[column] === 'object' && row[column].isForeign
    );
    return rowWithForeignKey ? rowWithForeignKey[column].ref : null;
  };

  const getOptionsForTable = (tableName) => {
    const refTable = tables.find(t => t.name === tableName);
    if (!refTable) return [];
    
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
    const requiredColumns = columns;
    const isEmpty = requiredColumns.some(col => {
      const value = formData[col];
      if (isForeignKey(col)) {
        return !value || value === '';
      }
      return !value || value.trim() === '';
    });
    
    if (isEmpty) {
      alert("Por favor, completa todos los campos");
      return;
    }
    
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
      <h3>{editingItem ? `Edit ${table.name.slice(0, -1)}` : `Create new ${table.name.slice(0, -1)}`}</h3>
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
          text={editingItem ? "Update" : "Save"} 
          onClick={handleSubmit}
          variant="save-button"
        />
      </div>
    </div>
  );
}

export default CreateForm;