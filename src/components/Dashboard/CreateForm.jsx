// src/components/Dashboard/CreateForm.jsx
import React, { useState, useEffect, useRef } from "react";
import Button from "../Button/Button";
import { TABLE_METADATA } from "../../data/tables";
import "../../styles/components/CreateForm.css";
// import { validateRequired } from "../../utils/validators";


function CreateForm({ table, tables, onClose, onSave, editingItem }) {
  const meta = TABLE_METADATA[table.name] || { columns: {} };
  const [errors, setErrors] = useState({});
  const columnsMeta = meta.columns || {};
  const columns = Object.keys(columnsMeta).filter(c => c !== "Id"); // hide id
  const [formData, setFormData] = useState({});
  const lastEditedId = useRef(null);

  useEffect(() => {
    // Inicializar el formData tanto para create como para edit
    if (editingItem && editingItem.Id !== lastEditedId.current) {
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
      lastEditedId.current = editingItem.Id;
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

    // Buscar columna de label preferida (name, title, o la primera que no sea id)
    const labelCol =
      ref.columns.find(c => c !== "Id" && (c.toLowerCase().includes("name") || c.toLowerCase().includes("title")))
      || ref.columns.find(c => c !== "Id")
      || "visualId";

    return ref.rows.map(r => ({
      value: r.Id,   
      label: `${r.visualId} - ${r[labelCol] ?? "Item"}`
    }));
  };


  const handleChange = (col, value) => {
    setFormData(prev => ({ ...prev, [col]: value }));
    setErrors(prev => ({ ...prev, [col]: null }));
  };

  const validate = () => {
    const errors = {};

    for (const col of columns) {
      const metaCol = columnsMeta[col];
      if (!metaCol || metaCol.readonly) continue;

      const rawVal = formData[col];
      const val = typeof rawVal === "string" ? rawVal.trim() : rawVal;

      // ========================
      // REQUIRED
      // ========================
      if (metaCol.required) {
        if (val === "" || val === null || val === undefined) {
          errors[col] = "This field is required";
          continue;
        }
      }

      // ========================
      // STRING
      // ========================
      if (metaCol.type === "string" && val) {
        if (val.length < 3) {
          errors[col] = "The field must be at least 3 characters long.";
        }
      }

      // ========================
      // NUMBER
      // ========================
      if (metaCol.type === "number" && val !== "" && val !== null) {
        const num = Number(val);

        if (isNaN(num)) {
          errors[col] = "This field must to be a valid number";
          continue;
        }

        if (num < 0) {
          errors[col] = "This field cannot be negative";
          continue;
        }

        // enteros específicos
        if (
          ["experience", "score"].includes(col) &&
          !Number.isInteger(num)
        ) {
          errors[col] = "This field must be an integer value";
        }
      }
    }

    // ========================
    // DEPENDENCIAS ENTRE CAMPOS
    // ========================

    // Equipments
    if (table.name === "Equipments") {
      if (
        formData.LocationTypeId === "Department" &&
        !formData.departmentId
      ) {
        errors.departmentId = "This field is required when Location Type is Department";
      }

      if (formData.LocationTypeId !== "Department" && formData.departmentId) {
        errors.departmentId = "This field must be empty when Location Type is not Department";
      }

      if ((formData.StateId === "Operative" || formData.StateId === "UnderMaintenance")) {
        if(formData.LocationTypeId !== "Department"){
          errors.LocationTypeId = "Location Type must be Department for Operative or Under Maintenance equipments";
        }
        if(!formData.departmentId){
          errors.departmentId = "This field is required for Operative or Under Maintenance equipments";
        }
      }
      else if (formData.StateId === "Decommissioned" && formData.LocationTypeId !== "Warehouse") {
        errors.LocationTypeId = "Location Type must be Warehouse for Decommissioned equipments";
      }
      else if (formData.StateId === "Disposed" && formData.LocationTypeId !== "Disposal") {
        errors.LocationTypeId = "Location Type must be Disposal for Disposed equipments";
      }
    }

    // EquipmentDecommissions
    if (table.name === "EquipmentDecommissions") {
      if (formData.DestinyTypeId === "Department") {
        if (!formData.departmentId) {
          errors.departmentId = "DepartmentId is requiered for Department destiny";
        }
        if (!formData.recipientId) {
          errors.recipientId = "RecipientId is required for Department destiny";
        }
      }
      else {
        if (formData.departmentId) {
          errors.departmentId = "DepartmentId must be empty for non-Department destiny";
        }
        if (formData.recipientId) {
          errors.recipientId = "RecipientId must be empty for non-Department destiny";
        }
      }
    }

    // ========================
    // RESULTADO
    // ========================
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
      setErrors(errors);
      return false;
    }

    setErrors({});
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
                {errors[col] && (
                  <div className="form-error">
                    {errors[col]}
                  </div>
                )}
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
                {errors[col] && (
                  <div className="form-error">
                    {errors[col]}
                  </div>
                )}
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
              {errors[col] && (
                <div className="form-error">
                  {errors[col]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <Button 
          variant="btn-base btn-gray btn-compact"
          onClick={onClose}
          text="Cancel"
        />
        <Button 
          variant="btn-base btn-green btn-compact"
          onClick={onSubmit}
          text={editingItem ? 'Update' : 'Save'}
        />
      </div>
    </div>
  );
}

export default CreateForm;
