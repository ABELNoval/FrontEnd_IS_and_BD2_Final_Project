import React, { useState, useEffect, useRef } from "react";
import Button from "../Button/Button";
import "./CreateForm.css";

function CreateForm({ table, tables, onClose, onSave, editingItem }) {
  const columns = table.columns.filter(col => col !== "id");
  const [formData, setFormData] = useState({});
  const lastEditedId = useRef(null);

  useEffect(() => {
    // Solo inicializar si el id de edición cambió
    if (editingItem && editingItem.id !== lastEditedId.current) {
      const initialData = {};
      columns.forEach(column => {
        const value = editingItem[column];
        if (value && typeof value === "object" && value.isForeign) {
          initialData[column] = value.value.toString();
        } else {
          initialData[column] = value || "";
        }
      });
      setFormData(initialData);
      lastEditedId.current = editingItem.id; // 👈 Guardamos el id actual
    } else if (!editingItem) {
      // Crear vacíos si es modo creación
      const emptyData = {};
      columns.forEach(column => (emptyData[column] = ""));
      setFormData(emptyData);
      lastEditedId.current = null;
    }
  }, [editingItem, columns]);

  const isForeignKey = column =>
    table.rows.some(row => row[column]?.isForeign);

  const getReferencedTable = column => {
    const refRow = table.rows.find(row => row[column]?.isForeign);
    return refRow ? refRow[column].ref : null;
  };

  const getOptionsForTable = tableName => {
    const refTable = tables.find(t => t.name === tableName);
    if (!refTable) return [];
    const labelColumn = refTable.columns.find(c => c !== "id") || "id";
    return refTable.rows.map(row => ({
      value: row.id,
      label: row[labelColumn] || `ID: ${row.id}`,
    }));
  };

  const handleInputChange = (column, value) => {
    setFormData(prev => ({
      ...prev,
      [column]: value,
    }));
  };

  const handleSubmit = () => {
    const isEmpty = columns.some(col => {
      const val = formData[col];
      if (isForeignKey(col)) return !val;
      return !val?.trim();
    });
    if (isEmpty) {
      alert("Por favor completa todos los campos");
      return;
    }

    const processedData = { ...formData };
    columns.forEach(col => {
      if (isForeignKey(col)) {
        const refTable = getReferencedTable(col);
        processedData[col] = {
          value: parseInt(processedData[col]),
          isForeign: true,
          ref: refTable,
        };
      }
    });
    onSave(processedData);
  };

  return (
    <div className="create-form-container">
      <h3>
        {editingItem
          ? `Edit ${table.name.slice(0, -1)}`
          : `Create new ${table.name.slice(0, -1)}`}
      </h3>
      <div className="create-form">
        {columns.map(column => {
          if (isForeignKey(column)) {
            const refTable = getReferencedTable(column);
            const options = getOptionsForTable(refTable);
            return (
              <div key={column} className="form-field">
                <label>{column}:</label>
                <select
                  value={formData[column] || ""}
                  onChange={e =>
                    handleInputChange(column, e.target.value)
                  }
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
              <input
                type="text"
                value={formData[column] ?? ""}
                placeholder={`Enter ${column}`}
                onChange={e =>
                  handleInputChange(column, e.target.value)
                }
                className="form-input"
              />
            </div>
          );
        })}
      </div>
      <div className="form-actions">
        <Button text="Cancel" onClick={onClose} variant="cancel-button" />
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
