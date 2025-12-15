import React, { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react"; // <-- Añadir esta importación
import Button from "../Button/Button";
import FilterPanel from "./FilterPanel";
import Panel from "../Panel/Panel";
import "../../styles/components/Table.css";

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
  const [openMenuRow, setOpenMenuRow] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const dotsRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuRow !== null && !event.target.closest('.row-actions-panel') && !event.target.closest('.dots-btn')) {
        setOpenMenuRow(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuRow]);

  const toggleRowMenu = (id, event) => {
    if (!event) return;
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    if (openMenuRow === id) {
      setOpenMenuRow(null);
    } else {
      // Calcular posición exacta para que el menú aparezca justo debajo del botón
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 140 + rect.width // Ajustar para alinear a la derecha
      });
      setOpenMenuRow(id);
    }
  };

  if (!table) {
    return <div className="table-empty">Selecciona una tabla para verla</div>;
  }

  const visibleColumns = table?.columns?.filter(col => col !== "id") || [];
  const displayRows = table.filteredRows || table.rows;

  const formatCell = (cell) => {
    if (cell === null || cell === undefined) return "";

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

    if (typeof cell === "string" && /^\d{4}-\d{2}-\d{2}/.test(cell)) {
      const d = new Date(cell);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString();
      }
    }

    if (typeof cell === "boolean") {
      return cell ? "Yes" : "No";
    }

    if (typeof cell === "number") {
      return cell;
    }

    return String(cell);
  };

  return (
    <>
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
            
            {/* Botón Create */}
            <Button text = "Create" onClick = {onCreateClick} variant = "btn-base"/>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-scroll">
          <table className="table-viewer">
            <thead>
              <tr>
                <th className="checkbox-header"></th>
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
                      className="dots-btn"
                      ref={(el) => (dotsRefs.current[row.id] = el)}
                      onClick={(e) => toggleRowMenu(row.id, e)}
                    >
                      ⋮
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

        {/* PAGINATION */}
        <div className="table-pagination">
          <button className="pagination-btn" onClick={() => onPageChange(1)} disabled={currentPage === 1}>⏮</button>
          <button className="pagination-btn" onClick={() => onPageChange(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>◀</button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button className="pagination-btn" onClick={() => onPageChange(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>▶</button>
          <button className="pagination-btn" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>⏭</button>
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
      </div>

      {/* PANEL DEL MENÚ DE ACCIONES - POSICIONADO ABSOLUTAMENTE */}
      {openMenuRow && (
        <Panel
          open={true}
          onClose={() => setOpenMenuRow(null)}
          className="row-actions-panel"
          portal={true}
          closeOnOutside={true}
          closeOnEsc={true}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 10000
          }}
        >
          <div className="row-actions-content">
            <div
              className="action-item"
              onClick={() => {
                const row = displayRows.find(r => r.id === openMenuRow);
                if (row) onEdit(row);
                setOpenMenuRow(null);
              }}
            >
              <span>Edit</span>
            </div>
            <div
              className="action-item delete"
              onClick={() => {
                onDelete(openMenuRow);
                setOpenMenuRow(null);
              }}
            >
              <span>Delete</span>
            </div>
          </div>
        </Panel>
      )}
    </>
  );
}

export default TableViewer;