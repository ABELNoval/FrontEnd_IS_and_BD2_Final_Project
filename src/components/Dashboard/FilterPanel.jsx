import React, { useState } from "react";
import { Filter, X, Search, ChevronRight, ChevronDown } from "lucide-react";
import "./FilterPanel.css";

function FilterPanel({ table, tables, onFilter, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [expandedFK, setExpandedFK] = useState(null); // <-- nuevo


  const visibleColumns =
    table?.columns?.filter((col) => col !== "id" && col !== "visualId") || [];

  // -------------------------------
  // Detectar si una columna es FK
  // -------------------------------
  const isForeignKey = (col) =>
    col.toLowerCase().endsWith("id") && col !== "id";

  // departmentId → Departments
  const getReferencedTable = (fk) => {
  const base = fk.replace(/Id$/i, "").toLowerCase();

  // Buscar tabla cuyo nombre (sin plural ni mayúsculas) coincida
  const match = tables.find((t) =>
      t.name.toLowerCase().replace(/s$/, "") === base
    );

    return match ? match.name : null;
  };


  const getRefColumns = (refTableName) => {
    const t = tables.find((t) => t.name === refTableName);
    if (!t) return [];
    return t.columns.filter(
      (c) => c !== "id" && c !== "visualId"
    );
  };

  // -------------------------------
  // Manejo de cambios
  // -------------------------------
  const handleFilterChange = (column, value) => {
    const updated = { ...filters };

    if (value.trim() === "") {
      delete updated[column];
    } else {
      updated[column] = value;
    }

    setFilters(updated);
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
    onFilter(filters);
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    setFilters({});
    setActiveFilters({});
    onClear();
    setIsOpen(false);
  };

  const removeFilter = (column) => {
    const newF = { ...filters };
    delete newF[column];
    setFilters(newF);

    const newAF = { ...activeFilters };
    delete newAF[column];
    setActiveFilters(newAF);
    onFilter(newAF);
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="filter-panel">
      <button
        className={`filter-toggle ${hasActiveFilters ? "has-filters" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={18} />
        {hasActiveFilters && (
          <span className="filter-badge">
            {Object.keys(activeFilters).length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          <div className="filter-header">
            <h4>Filter Table</h4>
            <button className="close-filter" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="filter-content">
            {visibleColumns.map((column) => {
              const fk = isForeignKey(column);

              return (
                <div key={column} className="filter-field">
                  <label>{column}:</label>

                  {/* -----------------------
                      Caso normal: Input simple
                  ------------------------ */}
                  {!fk && (
                    <div className="filter-input-container">
                      <Search size={14} className="search-icon" />
                      <input
                        type="text"
                        value={filters[column] || ""}
                        onChange={(e) =>
                          handleFilterChange(column, e.target.value)
                        }
                        placeholder={`Filter by ${column}...`}
                        className="filter-input"
                      />
                    </div>
                  )}

                  {/* -----------------------
                      Caso FK: botón expandible
                  ------------------------ */}
                  {fk && (
                    <div className="fk-filter-block">
                      <button
                        className="fk-expand-btn"
                        onClick={() =>
                          setExpandedFK(expandedFK === column ? null : column)
                        }
                      >
                        {expandedFK === column ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                        Filter FK Fields
                      </button>

                      {expandedFK === column && (
                        <div className="fk-subpanel">
                          <h5>Filter {column} fields</h5>

                          {(() => {
                            const refName = getReferencedTable(column);
                            const subColumns = getRefColumns(refName);

                            if (!refName) {
                              return <p>No reference table found.</p>;
                            }

                            return subColumns.map((sc) => {
                              const key = `${column}.${sc}`;

                              return (
                                <div key={key} className="filter-sub-field">
                                  <label>
                                    {refName}.{sc}
                                  </label>
                                  <div className="filter-input-container">
                                    <Search
                                      size={14}
                                      className="search-icon"
                                    />
                                    <input
                                      type="text"
                                      value={filters[key] || ""}
                                      onChange={(e) =>
                                        handleFilterChange(key, e.target.value)
                                      }
                                      placeholder={`Filter by ${sc}...`}
                                      className="filter-input"
                                    />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="filter-actions">
            <button className="filter-clear" onClick={clearAllFilters}>
              Clear All
            </button>
            <button className="filter-apply" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="active-filters">
          {Object.entries(activeFilters).map(([column, value]) => (
            <span key={column} className="active-filter-tag">
              {column}: {value}
              <button onClick={() => removeFilter(column)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
