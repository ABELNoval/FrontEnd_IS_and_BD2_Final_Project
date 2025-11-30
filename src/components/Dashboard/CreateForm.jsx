// src/components/Dashboard/CreateForm.jsx
import React, { useState, useEffect, useRef } from "react";
import Button from "../Button/Button";
import { TABLE_METADATA } from "../../data/tables";
import "./CreateForm.css";


function CreateForm({ table, tables, onClose, onSave, editingItem }) {
  const meta = TABLE_METADATA[table.name] || { columns: {} };
  const columnsMeta = meta.columns || {};
  const columns = Object.keys(columnsMeta).filter(c => c !== "id"); // hide id
  const [formData, setFormData] = useState({});
  const lastEditedId = useRef(null);

  useEffect(() => {
    // Inicializar el formData tanto para create como para edit
    if (editingItem && editingItem.id !== lastEditedId.current) {
      const initial = {};
      columns.forEach(col => {
        const val = editingItem[col];
        // si viene como objeto foreign en rows: mantener solo el value
        if (val && typeof val === "object" && val.isForeign) {
          initial[col] = val.value;
        } else {
          initial[col] = val ?? "";
        }
      });
      setFormData(initial);
      lastEditedId.current = editingItem.id;
    } else if (!editingItem) {
      const empty = {};
      columns.forEach(col => (empty[col] = ""));
      setFormData(empty);
      lastEditedId.current = null;
    }
  }, [editingItem, table.name]); // re-init si cambia la tabla

  const getOptionsForFk = (refTableName) => {
    const ref = tables.find(t => t.name === refTableName);
    if (!ref) return [];
    // buscar label column - prefer name o first non-id
    const labelCol = ref.columns.find(c => c !== "id" && (c.toLowerCase().includes("name") || c.toLowerCase().includes("title"))) || ref.columns[1] || "id";
    return ref.rows.map(r => ({
      value: r.id,
      label: r[labelCol] ?? `ID: ${r.id}`
    }));
  };

  const handleChange = (col, value) => {
    setFormData(prev => ({ ...prev, [col]: value }));
  };

  const validate = () => {
    for (const col of columns) {
      const metaCol = columnsMeta[col];
      if (!metaCol) continue;
      if (metaCol.readonly) continue;
      const val = formData[col];
      if (metaCol.required) {
        if (val === null || val === undefined || String(val).trim() === "") {
          alert(`El campo "${col}" es obligatorio.`);
          return false;
        }
      }
      // types basic checks
      if (val && metaCol.type === "date") {
        // no further
      }
      if (val && metaCol.type === "uuid") {
        // can't robustly validate GUID client-side easily; skip strict check
      }
    }
    return true;
  };

  const preparePayload = () => {
    const payload = {};
    columns.forEach(col => {
      const metaCol = columnsMeta[col];
      if (!metaCol) {
        payload[col] = formData[col];
        return;
      }
      if (metaCol.readonly) return; // never send readonly
      const val = formData[col];
      if (metaCol.type === "fk") {
        // FK expect just the id (string GUID)
        payload[col] = val || null;
      } else if (metaCol.type === "date") {
        // ensure date string (yyyy-mm-dd) or full iso depending on backend
        payload[col] = val ? new Date(val).toISOString() : null;
      } else if (metaCol.type === "number") {
        payload[col] = val === "" ? null : Number(val);
      } else {
        payload[col] = val;
      }
    });
    // If editing include id
    if (editingItem && editingItem.id) payload.id = editingItem.id;
    return payload;
  };

  const onSubmit = () => {
    if (!validate()) return;
    const payload = preparePayload();
    onSave(payload);
  };

  return (
    <div className="create-form-container">
      <h3>{editingItem ? `Edit ${table.name.slice(0, -1)}` : `Create new ${table.name.slice(0, -1)}`}</h3>
      <div className="create-form">
        {columns.map(col => {
          const metaCol = columnsMeta[col] || { type: "string" };
          if (metaCol.readonly) {
            return (
              <div key={col} className="form-field">
                <label>{col}:</label>
                <input type="text" value={formData[col] ?? ""} disabled />
              </div>
            );
          }

          if (metaCol.type === "fk") {
            const refName = metaCol.ref;
            const options = getOptionsForFk(refName);
            return (
              <div key={col} className="form-field">
                <label>{col}:</label>
                <select
                  value={formData[col] ?? ""}
                  onChange={e => handleChange(col, e.target.value)}
                  className="form-select"
                >
                  <option value="">{`Select ${refName}`}</option>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            );
          }

          if (metaCol.type === "enum") {
            return (
              <div key={col} className="form-field">
                <label>{col}:</label>
                <select
                  value={formData[col] ?? ""}
                  onChange={e => handleChange(col, e.target.value)}
                  className="form-select"
                >
                  <option value="">{`Select ${col}`}</option>
                  {metaCol.values.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            );
          }

          if (metaCol.type === "date") {
            // show input type date (value YYYY-MM-DD)
            const dateVal = formData[col] ? new Date(formData[col]).toISOString().slice(0,10) : "";
            return (
              <div key={col} className="form-field">
                <label>{col}:</label>
                <input
                  type="date"
                  value={dateVal}
                  onChange={e => handleChange(col, e.target.value)}
                  className="form-input"
                />
              </div>
            );
          }

          // default text/number
          return (
            <div key={col} className="form-field">
              <label>{col}:</label>
              <input
                type={metaCol.type === "number" ? "number" : "text"}
                value={formData[col] ?? ""}
                placeholder={`Enter ${col}`}
                onChange={e => handleChange(col, e.target.value)}
                className="form-input"
              />
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <Button text="Cancel" onClick={onClose} variant="cancel-button" />
        <Button text={editingItem ? "Update" : "Save"} onClick={onSubmit} variant="save-button" />
      </div>
    </div>
  );
}

export default CreateForm;
