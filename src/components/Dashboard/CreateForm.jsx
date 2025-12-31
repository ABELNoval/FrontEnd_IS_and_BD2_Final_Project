// src/components/Dashboard/CreateForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import Button from "../Button/Button";
import { TABLE_METADATA } from "../../data/tables";
//import { dashboardService } from "../../services/dashboardService";
import "../../styles/components/CreateForm.css";
// import { validateRequired } from "../../utils/validators";


function CreateForm({ table, tables, allDepartments, onClose, onSave, editingItem }) {
  const meta = TABLE_METADATA[table.name] || { columns: {} };
  const [errors, setErrors] = useState({});
  const columnsMeta = meta.columns || {};
  // hide Id and columns marked as hidden
  const columns = Object.keys(columnsMeta).filter(c => c !== "Id" && !columnsMeta[c]?.hidden);
  const [formData, setFormData] = useState({});
  const lastEditedId = useRef(null);

  // Create reverse enum map (numeric ID -> string name)
  const getReverseEnumMap = (enumMap) => {
    if (!enumMap) return null;
    return Object.fromEntries(
      Object.entries(enumMap).map(([name, id]) => [id, name])
    );
  };

  useEffect(() => {
    // Initialize formData for both create and edit
    if (editingItem && editingItem.Id !== lastEditedId.current) {
      const initial = {};
      columns.forEach(col => {
        const metaCol = columnsMeta[col];
        let val = editingItem[col];
        
        // if value comes as foreign object in rows: keep only the value
        if (val && typeof val === "object" && val.isForeign) {
          initial[col] = val.value;
        } 
        // If enum with enumMap, convert numeric ID to string name
        else if (metaCol?.type === "enum" && metaCol?.enumMap && typeof val === "number") {
          const reverseMap = getReverseEnumMap(metaCol.enumMap);
          initial[col] = reverseMap[val] ?? val;
        }
        else {
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

  // Format column name for display (e.g., "DepartmentId" -> "Department", "AcquisitionDate" -> "Acquisition Date")
  const formatLabel = (col) => {
    // Remove "Id" suffix for FK fields
    let label = col.endsWith("Id") ? col.slice(0, -2) : col;
    // Add spaces before capital letters (camelCase to Title Case)
    label = label.replace(/([A-Z])/g, ' $1').trim();
    return label;
  };

  const getOptionsForFk = (refTableName, columnName) => {
    // For TransferRequests TargetDepartmentId, use all departments (not filtered by section)
    if (table.name === "TransferRequests" && columnName === "TargetDepartmentId" && allDepartments.length > 0) {
      return allDepartments.map((dept, index) => ({
        value: dept.Id || dept.id,
        label: `#${index + 1} - ${dept.Name || dept.name || "Department"}`
      }));
    }

    const ref = tables.find(t => t.name === refTableName);
    if (!ref) return [];

    // Find preferred label column (name, title, or first non-id column)
    const labelCol =
      ref.columns.find(c => c !== "Id" && (c.toLowerCase().includes("name") || c.toLowerCase().includes("title")))
      || ref.columns.find(c => c !== "Id")
      || "visualId";

    return ref.rows.map(r => ({
      value: r.Id,   
      label: `#${r.visualId} - ${r[labelCol] ?? "Item"}`
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

        // specific integer fields
        if (
          ["experience", "score"].includes(col) &&
          !Number.isInteger(num)
        ) {
          errors[col] = "This field must be an integer value";
        }
      }
    }

    // ========================
    // FIELD DEPENDENCIES
    // ========================

    // Equipments
    if (table.name === "Equipments") {
      if (
        formData.LocationTypeId === "Department" &&
        !formData.DepartmentId
      ) {
        errors.DepartmentId = "You must select a Department when Location Type is 'Department'";
      }

      if ((formData.StateId === "Operative" || formData.StateId === "UnderMaintenance")) {
        if(formData.LocationTypeId !== "Department"){
          errors.LocationTypeId = "Operative or Under Maintenance equipment must be located in a Department";
        }
        if(!formData.DepartmentId){
          errors.DepartmentId = "You must select a Department for Operative or Under Maintenance equipment";
        }
      }
      else if (formData.StateId === "Decommissioned" && formData.LocationTypeId !== "Warehouse") {
        errors.LocationTypeId = "Decommissioned equipment must be located in Warehouse";
      }
      else if (formData.StateId === "Disposed" && formData.LocationTypeId !== "Disposal") {
        errors.LocationTypeId = "Disposed equipment must be in Disposal location";
      }
    }

    // EquipmentDecommissions
    if (table.name === "EquipmentDecommissions") {
      if (formData.DestinyTypeId === "Department") {
        if (!formData.DepartmentId) {
          errors.DepartmentId = "You must select a Department for this destiny type";
        }
        if (!formData.RecipientId) {
          errors.RecipientId = "You must select a Recipient for Department destiny";
        }
      }
      else {
        if (formData.DepartmentId) {
          errors.DepartmentId = "Department must be empty for Warehouse or Disposal destiny";
        }
        if (formData.RecipientId) {
          errors.RecipientId = "Recipient must be empty for Warehouse or Disposal destiny";
        }
      }
    }

    // ========================
    // RESULT
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
    const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
    
    columns.forEach(col => {
      const metaCol = columnsMeta[col];
      if (!metaCol) {
        payload[col] = formData[col];
        return;
      }
      if (metaCol.readonly) return; // never send readonly
      const val = formData[col];
      if (metaCol.type === "fk") {
        // FK: if required, send the value; if optional and empty, send empty GUID
        if (val) {
          payload[col] = val;
        } else if (metaCol.required) {
          payload[col] = null; // Will fail validation in backend
        } else {
          payload[col] = EMPTY_GUID; // Optional FK with no value
        }
      } else if (metaCol.type === "date") {
        // ensure date string (yyyy-mm-dd) or full iso depending on backend
        payload[col] = val ? new Date(val).toISOString() : null;
      } else if (metaCol.type === "number") {
        payload[col] = val === "" ? null : Number(val);
      } else if (metaCol.type === "enum" && metaCol.enumMap) {
        // Convert enum string value to numeric ID using enumMap
        const mappedVal = metaCol.enumMap[val];
        payload[col] = mappedVal !== undefined ? mappedVal : (val || null);
        console.log(`Enum ${col}: "${val}" -> ${payload[col]}`);
      } else {
        payload[col] = val;
      }
    });
    // If editing include id
    if (editingItem && editingItem.id) payload.id = editingItem.id;
    return payload;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    const payload = preparePayload();
    
    console.log("Sending payload:", JSON.stringify(payload, null, 2));
    
    try {
      await onSave(payload);
    } catch (err) {
      // If the parent component throws validation errors (object with field names)
      if (err && typeof err === 'object' && !Array.isArray(err)) {
        setErrors(prev => ({ ...prev, ...err }));
      } else {
        console.error("Error saving:", err);
      }
    }
  };

  return (
    <div className="create-form-container">
      <div className="create-form-header">
        <h3>{editingItem ? `Edit ${table.name.slice(0, -1)}` : `Create new ${table.name.slice(0, -1)}`}</h3>
        <Button
          variant="btn-close"
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>
      <div className="create-form">
        {columns.map(col => {
          const metaCol = columnsMeta[col] || { type: "string" };
          const label = formatLabel(col);
          
          if (metaCol.readonly) {
            return (
              <div key={col} className="form-field">
                <label>{label}:</label>
                <input 
                  type="text" 
                  value={formData[col] ?? ""} 
                  disabled 
                  className="form-input form-input-readonly"
                />
              </div>
            );
          }

          if (metaCol.type === "fk") {
            const refName = metaCol.ref;
            const options = getOptionsForFk(refName, col);
            return (
              <div key={col} className="form-field">
                <label>{label}:</label>
                <select
                  value={formData[col] ?? ""}
                  onChange={e => handleChange(col, e.target.value)}
                  className="form-select"
                >
                  <option value="">{`Select ${label}`}</option>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errors[col] && (
                  <div className="form-error">
                    {errors[col]}
                  </div>
                )}
              </div>
            );
          }

          if (metaCol.type === "enum") {
            return (
              <div key={col} className="form-field">
                <label>{label}:</label>
                <select
                  value={formData[col] ?? ""}
                  onChange={e => handleChange(col, e.target.value)}
                  className="form-select"
                >
                  <option value="">{`Select ${label}`}</option>
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
                <label>{label}:</label>
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
              <label>{label}:</label>
              <input
                type={metaCol.type === "number" ? "number" : "text"}
                value={formData[col] ?? ""}
                placeholder={`Enter ${label}`}
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
