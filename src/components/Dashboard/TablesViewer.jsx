import React from "react";
import { Edit, Trash2 } from "lucide-react";
import Button from "../Button/Button";
import FilterPanel from "./FilterPanel";
import "./TableViewer.css";

function TableViewer({
  table,
  tables,
  onForeignClick,
  onToggleRow,
  onCreateClick,
  onEdit,
  onDelete,
  onFilter,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange
}) {

  if (!table) {
    return <div className="table-empty">Selecciona una tabla para verla</div>;
  }

  // ――――――――――――――――――――――――
  // 1. Columnas visibles
  // ――――――――――――――――――――――――
  const visibleColumns = table?.columns?.filter(col => col !== "id") || [];
  const displayRows = table.filteredRows || table.rows;

  // ――――――――――――――――――――――――
  // 2. Formateo universal de celdas
  // ――――――――――――――――――――――――
  const formatCell = (cell) => {
    if (cell === null || cell === undefined) return "";

    // FK: objeto especial
    if (typeof cell === "object" && cell.isForeign) {
      const label = cell.visual ?? cell.value;
      return (
        <span
          className="foreign"
          onClick={() => onForeignClick && onForeignClick(cell.ref, cell.value)}
        >
          {cell.ref} ({label})
        </span>
      );
    }

    // Fecha ISO → fecha legible
    if (typeof cell === "string" && /^\d{4}-\d{2}-\d{2}/.test(cell)) {
      const d = new Date(cell);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString();
      }
    }

    // Boolean
    if (typeof cell === "boolean") {
      return cell ? "Yes" : "No";
    }

    // Número
    if (typeof cell === "number") {
      return cell;
    }

    // String normal
    return String(cell);
  };

  // ――――――――――――――――――――――――
  // RETURN JSX
  // ――――――――――――――――――――――――
  return (
    <div className="table-container">
      {/* HEADER */}
      <div className="table-header">
        <h2 className="table-title">{table.name}</h2>
        <div className="table-header-actions">
          <FilterPanel
            table={table}
            tables={tables}
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

      {/* PAGINATION */}
      <div className="pagination-controls">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1}>⏮ First</button>
        <button onClick={() => onPageChange(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>◀ Prev</button>

        <span className="page-info">Page {currentPage} of {totalPages}</span>

        <button onClick={() => onPageChange(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next ▶</button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>Last ⏭</button>

        <select
          className="page-size-selector"
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="table-scroll">
        <table className="table-viewer">
          <thead>
            <tr>
              <th className="checkbox-header"></th>
              {/* Columna visualId al inicio */}
              <th>#</th>
              {visibleColumns.map((col) => (
                col !== "visualId" && <th key={col}>{col}</th>
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
                {/* Checkbox */}
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={table.selectedRows?.has(row.id) || false}
                    onChange={() => onToggleRow(row.id)}
                  />
                </td>

                {/* visualId */}
                <td>{row.visualId}</td>

                {/* Columnas normales */}
                {visibleColumns.map((col) => {
                  if (col === "visualId") return null;
                  const cell = row[col];
                  return <td key={col}>{formatCell(cell)}</td>;
                })}

                {/* Actions */}
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

        {displayRows?.length === 0 && (
          <div className="no-results">No matching records found</div>
        )}
      </div>
    </div>
  );
}

export default TableViewer;
