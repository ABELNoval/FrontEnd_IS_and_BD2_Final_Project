import React from "react";
import Button from "../Button/Button";
import "./TableViewer.css";

function TableViewer({ table, onForeignClick, onToggleRow, onCreateClick }) { // 👈 Añadimos onCreateClick
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
          onClick={onCreateClick} // 👈 Usamos la función pasada
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableViewer;