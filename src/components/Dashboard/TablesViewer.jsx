import React from "react";
import { Edit, Trash2 } from "lucide-react";
import "./TableViewer.css";
import Button from "../Button/Button"

function TableViewer({ table, onForeignClick, onToggleRow, onCreateClick, onEdit, onDelete }) {
  if (!table) {
    return <div className="table-empty">Selecciona una tabla para verla</div>;
  }

  const visibleColumns = table?.columns?.filter((col) => col !== "id") || [];

  return (
    <div className="table-container">
      <div className="table-header">
        <h2 className="table-title">{table.name}</h2>
        <Button
          text={`Create ${table.name.slice(0, -1)}`}
          onClick={onCreateClick}
          variant="create-button"
        />
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
            {table?.rows?.map((row) => (
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
      </div>
    </div>
  );
}

export default TableViewer;