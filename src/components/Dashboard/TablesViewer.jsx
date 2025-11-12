import React from "react";
import { Edit, Trash2 } from "lucide-react";
import Button from "../Button/Button";
import FilterPanel from "./FilterPanel";
import "./TableViewer.css";

function TableViewer({ table, onForeignClick, onToggleRow, onCreateClick, onEdit, onDelete, onFilter }) {
  if (!table) {
    return <div className="table-empty">Selecciona una tabla para verla</div>;
  }

  const visibleColumns = table?.columns?.filter((col) => col !== "id") || [];
  const displayRows = table.filteredRows || table.rows;

  return (
    <div className="table-container">
      <div className="table-header">
        <h2 className="table-title">{table.name}</h2>
        <div className="table-header-actions">
          <FilterPanel 
            table={table} 
            onFilter={onFilter}
            onClear={() => onFilter({})}
          />
          <Button
            text={`Create ${table.name.slice(0, -1)}`}
            onClick={onCreateClick}
            variant="create-button"
          />
        </div>
      </div>

      <div className="table-scroll">
        <table className="table-viewer">
          <thead>
            <tr>
              <th className="checkbox-header"></th>
              {visibleColumns.map((col) => (
                <th key={col}>{col}</th>
              ))}
              <th className="actions-header">Actions</th>
            </tr>
          </thead>

          <tbody>
            {displayRows?.map((row) => (
              <tr 
                key={row.id} 
                className={table.selectedRows?.has(row.id) ? "selected" : ""}
              >
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={table.selectedRows?.has(row.id) || false}
                    onChange={() => onToggleRow(row.id)}
                  />
                </td>
                {visibleColumns.map((col) => {
                  const cell = row[col];
                  if (typeof cell === "object" && cell?.isForeign) {
                    return (
                      <td key={col}>
                        <span
                          className="foreign"
                          onClick={() =>
                            onForeignClick && onForeignClick(cell.ref, cell.value)
                          }
                        >
                          {cell.ref} ({cell.value})
                        </span>
                      </td>
                    );
                  }
                  return <td key={col}>{cell ?? ""}</td>;
                })}
                <td className="actions-cell">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => onEdit && onEdit(row)}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => onDelete && onDelete(row.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Mostrar mensaje si no hay resultados */}
        {displayRows?.length === 0 && (
          <div className="no-results">
            No matching records found
          </div>
        )}
      </div>
    </div>
  );
}

export default TableViewer;