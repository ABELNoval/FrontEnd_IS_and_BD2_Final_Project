import React, { useState, useEffect, useRef } from "react";
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
  onPageSizeChange,
  isPanelOpen = false
}) {
  const [openMenuRow, setOpenMenuRow] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tableScrollRef = useRef(null);

  // Verificar si se puede hacer scroll horizontal
  const checkScrollability = () => {
    const el = tableScrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  };

  // Function for horizontal scrolling
  const scrollTable = (direction) => {
    const el = tableScrollRef.current;
    if (el) {
      const scrollAmount = 200; // pixels per click
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Check immediately
    checkScrollability();
    
    // Check after CSS transition ends (0.3s = 300ms)
    const timer = setTimeout(checkScrollability, 350);
    
    const el = tableScrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
    }
    return () => {
      clearTimeout(timer);
      if (el) {
        el.removeEventListener('scroll', checkScrollability);
      }
      window.removeEventListener('resize', checkScrollability);
    };
  }, [table, isPanelOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuRow !== null && !event.target.closest('.row-actions-panel') && !event.target.closest('.btn-dots')) {
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
      // Calculate exact position so menu appears just below button
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 140 + rect.width // Adjust for right alignment
      });
      setOpenMenuRow(id);
    }
  };

  if (!table) {
    return <div className="table-empty">Select a table to view</div>;
  }

  const visibleColumns = table?.columns?.filter(col => col !== "Id") || [];
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
      <div className={`table-container ${isPanelOpen ? 'panel-open' : ''}`}>
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
            
            {/* Create Button */}
            <Button text = "Create" onClick = {onCreateClick} variant = "btn-base"/>
          </div>
        </div>

        {/* TABLE WITH HORIZONTAL NAVIGATION */}
        <div className="table-scroll-wrapper">
          {/* Left arrow */}}
          {canScrollLeft && (
            <Button
              variant="btn-table-scroll btn-table-scroll-left"
              onClick={() => scrollTable('left')}
            >
              ◀
            </Button>
          )}

          <div className="table-scroll" ref={tableScrollRef}>
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
                  key={row.Id}
                  className={table.selectedRows?.has(row.Id) ? "selected" : ""}
                >
                  {/* Checkbox */}
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={table.selectedRows?.has(row.Id) || false}
                      onChange={() => onToggleRow(row.Id)}
                    />
                  </td>

                  {/* visualId */}
                  <td>{row.visualId}</td>

                  {/* Normal columns */}
                  {visibleColumns.map((col) => {
                    if (col === "visualId") return null;
                    const cell = row[col];
                    return <td key={col}>{formatCell(cell)}</td>;
                  })}

                  {/* Actions */}
                  <td className="actions-cell">
                    <Button
                      variant="btn-dots"
                      onClick={(e) => toggleRowMenu(row.Id, e)}
                    >
                      ⋮
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {displayRows?.length === 0 && (
            <div className="no-results">No matching records found</div>
          )}
        </div>

          {/* Flecha derecha */}
          {canScrollRight && (
            <Button
              variant="btn-table-scroll btn-table-scroll-right"
              onClick={() => scrollTable('right')}
            >
              ▶
            </Button>
          )}
        </div>

        {/* PAGINATION */}
        <div className="table-pagination">
          <Button variant="btn-pagination" onClick={() => onPageChange(1)} disabled={currentPage === 1}>⏮</Button>
          <Button variant="btn-pagination" onClick={() => onPageChange(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>◀</Button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <Button variant="btn-pagination" onClick={() => onPageChange(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>▶</Button>
          <Button variant="btn-pagination" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>⏭</Button>
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

      {/* ACTIONS MENU PANEL - ABSOLUTELY POSITIONED */}
      {openMenuRow && (
        <Panel
          open={true}
          onClose={() => setOpenMenuRow(null)}
          className="row-actions-panel"
          position="dropdown"
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
                const row = displayRows.find(r => r.Id === openMenuRow);
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