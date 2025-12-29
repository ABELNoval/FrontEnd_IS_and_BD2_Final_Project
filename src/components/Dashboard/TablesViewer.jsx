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
  isPanelOpen = false,
  hiddenColumns = [],
  // TransferRequest specific props
  onAcceptRequest,
  onDenyRequest,
  onCancelRequest,
  // Maintenance specific props
  onCompleteMaintenance,
  // EquipmentDecommission specific props
  onReleaseDecommission,
  allDepartments = [],
  allEmployees = [],
  currentUserId
}) {
  const [openMenuRow, setOpenMenuRow] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tableScrollRef = useRef(null);
  
  // Release modal state for EquipmentDecommissions
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [releaseDecommissionId, setReleaseDecommissionId] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");

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

  const visibleColumns = table?.columns?.filter(col => 
    col !== "Id" && !hiddenColumns.includes(col) && !hiddenColumns.includes(col.toLowerCase())
  ) || [];
  const displayRows = table.filteredRows || table.rows;

  // Equipment state mapping for badges
  const equipmentStateMap = {
    1: { label: "Operative", className: "status-operative" },
    2: { label: "Under Maintenance", className: "status-maintenance" },
    3: { label: "Decommissioned", className: "status-decommissioned" },
    4: { label: "Disposed", className: "status-disposed" }
  };

  // Maintenance status mapping
  const maintenanceStatusMap = {
    1: { label: "In Progress", className: "status-pending" },
    2: { label: "Completed", className: "status-accepted" }
  };

  // MaintenanceType mapping
  const maintenanceTypeMap = {
    1: { label: "Preventive", className: "type-preventive" },
    2: { label: "Corrective", className: "type-corrective" },
    3: { label: "Predictive", className: "type-predictive" },
    4: { label: "Emergency", className: "type-emergency" }
  };

  // LocationType mapping  
  const locationTypeMap = {
    1: { label: "Department", className: "location-department" },
    2: { label: "Disposal", className: "location-disposal" },
    3: { label: "Warehouse", className: "location-warehouse" }
  };

  // DestinyType mapping (for EquipmentDecommissions)
  const destinyTypeMap = {
    1: { label: "Department", className: "destiny-department" },
    2: { label: "Disposal", className: "destiny-disposal" },
    3: { label: "Warehouse", className: "destiny-warehouse" }
  };

  const formatCell = (cell, colName = "", tableName = "") => {
    if (cell === null || cell === undefined) return "";

    // Special handling for Equipment StateId
    if (tableName === "Equipments" && colName === "StateId") {
      const stateInfo = equipmentStateMap[cell] || { label: cell, className: "" };
      return <span className={`status-badge ${stateInfo.className}`}>{stateInfo.label}</span>;
    }

    // Special handling for Equipment LocationTypeId
    if (tableName === "Equipments" && colName === "LocationTypeId") {
      const locationInfo = locationTypeMap[cell] || { label: cell, className: "" };
      return <span className={`status-badge ${locationInfo.className}`}>{locationInfo.label}</span>;
    }

    // Special handling for Maintenance StatusId
    if (tableName === "Maintenances" && colName === "StatusId") {
      const statusInfo = maintenanceStatusMap[cell] || { label: cell, className: "" };
      return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    }

    // Special handling for Maintenance MaintenanceTypeId
    if (tableName === "Maintenances" && colName === "MaintenanceTypeId") {
      const typeInfo = maintenanceTypeMap[cell] || { label: cell, className: "" };
      return <span className={`status-badge ${typeInfo.className}`}>{typeInfo.label}</span>;
    }

    // Special handling for EquipmentDecommissions DestinyTypeId
    if (tableName === "EquipmentDecommissions" && colName === "DestinyTypeId") {
      const destinyInfo = destinyTypeMap[cell] || { label: cell, className: "" };
      return <span className={`status-badge ${destinyInfo.className}`}>{destinyInfo.label}</span>;
    }

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
      // Manually format as DD/MM/YYYY to be consistent across all browsers/locales
      const [year, month, day] = cell.substring(0, 10).split('-');
      return `${day}/${month}/${year}`;
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
            
            {/* Create Button - only show if user has permission */}
            {onCreateClick && (
              <Button text = "Create" onClick = {onCreateClick} variant = "btn-base"/>
            )}
          </div>
        </div>

        {/* TABLE WITH HORIZONTAL NAVIGATION */}
        <div className="table-scroll-wrapper">
          {/* Left arrow */}
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
                {/* TransferRequests actions column */}
                {table.name === "TransferRequests" && <th className="actions-header">Actions</th>}
                {/* Maintenances actions column */}
                {table.name === "Maintenances" && <th className="actions-header">Actions</th>}
                {/* Regular actions column */}
                {table.name !== "TransferRequests" && table.name !== "Maintenances" && table.name !== "EquipmentDecommissions" && (onEdit || onDelete) && <th className="actions-header">Actions</th>}
                {table.name === "EquipmentDecommissions" && <th className="actions-header">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {displayRows?.map((row) => {
                // Determine TransferRequest action state
                const isTransferRequest = table.name === "TransferRequests";
                const isMaintenance = table.name === "Maintenances";
                const isDecommission = table.name === "EquipmentDecommissions";
                const statusId = row.StatusId?.value || row.StatusId;
                const requesterId = row.RequesterId?.value || row.RequesterId;
                const targetDeptId = row.TargetDepartmentId?.value || row.TargetDepartmentId;
                const isPending = statusId === 1;
                const isOwner = requesterId === currentUserId;
                
                // Maintenance status: 1 = InProgress, 2 = Completed
                const maintenanceStatusId = row.StatusId?.value || row.StatusId;
                const isMaintenanceInProgress = maintenanceStatusId === 1;
                
                // EquipmentDecommission: DestinyTypeId = 3 means Warehouse (can be released)
                const destinyTypeId = row.DestinyTypeId?.value || row.DestinyTypeId;
                const isInWarehouse = destinyTypeId === 3;
                
                // Status labels and colors
                const getStatusDisplay = () => {
                  if (statusId === 2) return { label: "Accepted", className: "status-accepted" };
                  if (statusId === 3) return { label: "Denied", className: "status-denied" };
                  if (statusId === 4) return { label: "Cancelled", className: "status-cancelled" };
                  return null;
                };
                const statusDisplay = getStatusDisplay();
                
                // Maintenance status display
                const getMaintenanceStatusDisplay = () => {
                  if (maintenanceStatusId === 2) return { label: "Completed", className: "status-accepted" };
                  return null;
                };
                const maintenanceStatusDisplay = getMaintenanceStatusDisplay();

                return (
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
                    return <td key={col}>{formatCell(cell, col, table.name)}</td>;
                  })}

                  {/* TransferRequests specific actions */}
                  {isTransferRequest && (
                    <td className="actions-cell transfer-request-actions">
                      {isPending ? (
                        isOwner ? (
                          <Button
                            variant="btn-cancel"
                            onClick={() => onCancelRequest && onCancelRequest(row.Id)}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <div className="action-buttons-group">
                            <Button
                              variant="btn-accept"
                              onClick={() => onAcceptRequest && onAcceptRequest(row.Id)}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="btn-deny"
                              onClick={() => onDenyRequest && onDenyRequest(row.Id)}
                            >
                              Deny
                            </Button>
                          </div>
                        )
                      ) : (
                        <span className={`status-badge ${statusDisplay?.className || ''}`}>
                          {statusDisplay?.label || ''}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Maintenances specific actions */}
                  {isMaintenance && (
                    <td className="actions-cell maintenance-actions">
                      {isMaintenanceInProgress ? (
                        <Button
                          variant="btn-accept"
                          onClick={() => onCompleteMaintenance && onCompleteMaintenance(row.Id)}
                        >
                          Complete
                        </Button>
                      ) : (
                        <span className={`status-badge ${maintenanceStatusDisplay?.className || ''}`}>
                          {maintenanceStatusDisplay?.label || ''}
                        </span>
                      )}
                    </td>
                  )}

                  {/* EquipmentDecommissions specific actions */}
                  {isDecommission && (
                    <td className="actions-cell decommission-actions">
                      {isInWarehouse ? (
                        <Button
                          variant="btn-accept"
                          onClick={() => {
                            setReleaseDecommissionId(row.Id);
                            setSelectedDepartmentId("");
                            setSelectedRecipientId("");
                            setReleaseModalOpen(true);
                          }}
                        >
                          Release
                        </Button>
                      ) : (
                        <span className={`status-badge ${destinyTypeId === 1 ? 'status-accepted' : destinyTypeId === 2 ? 'status-denied' : ''}`}>
                          {destinyTypeId === 1 ? 'In Department' : destinyTypeId === 2 ? 'Disposed' : ''}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Regular Actions - only show if user has edit or delete permission */}
                  {!isTransferRequest && !isMaintenance && !isDecommission && (onEdit || onDelete) && (
                  <td className="actions-cell">
                    <Button
                      variant="btn-dots"
                      onClick={(e) => toggleRowMenu(row.Id, e)}
                    >
                      ⋮
                    </Button>
                  </td>
                  )}
                </tr>
                );
              })}
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
            {onEdit && (
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
            )}
            {onDelete && (
            <div
              className="action-item delete"
              onClick={() => {
                onDelete(openMenuRow);
                setOpenMenuRow(null);
              }}
            >
              <span>Delete</span>
            </div>
            )}
          </div>
        </Panel>
      )}

      {/* Release to Department Modal */}
      {releaseModalOpen && (
        <div className="modal-overlay" onClick={() => setReleaseModalOpen(false)}>
          <div className="modal-content release-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Release Equipment to Department</h3>
            <p>Select the department and recipient for this equipment.</p>
            
            <div className="form-group">
              <label>Target Department</label>
              <select
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                className="form-select"
              >
                <option value="">-- Select Department --</option>
                {allDepartments.map((dept) => (
                  <option key={dept.id || dept.Id} value={dept.id || dept.Id}>
                    {dept.name || dept.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Recipient (Employee)</label>
              <select
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                className="form-select"
              >
                <option value="">-- Select Recipient --</option>
                {allEmployees
                  .filter((emp) => {
                    // Filter employees by selected department if a department is selected
                    if (!selectedDepartmentId) return true;
                    const empDeptId = emp.DepartmentId?.value || emp.DepartmentId;
                    return empDeptId === selectedDepartmentId;
                  })
                  .map((emp) => (
                    <option key={emp.Id} value={emp.Id}>
                      {emp.Name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="modal-actions">
              <Button
                variant="btn-cancel"
                onClick={() => setReleaseModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="btn-accept"
                onClick={() => {
                  if (selectedDepartmentId && selectedRecipientId && onReleaseDecommission) {
                    onReleaseDecommission(releaseDecommissionId, selectedDepartmentId, selectedRecipientId);
                    setReleaseModalOpen(false);
                  }
                }}
                disabled={!selectedDepartmentId || !selectedRecipientId}
              >
                Confirm Release
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TableViewer;