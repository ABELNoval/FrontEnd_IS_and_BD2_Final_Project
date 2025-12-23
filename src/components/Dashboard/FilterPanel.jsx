import React, { useState } from "react";
import { Filter, X, Search, ChevronRight, ChevronDown } from "lucide-react";
import Button from "../Button/Button";
import Input from "../Input/Input";
import "../../styles/components/FilterPanel.css";

function FilterPanel({ table, tables, onFilter, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [expandedFK, setExpandedFK] = useState(null); // <-- new


  const visibleColumns =
    table?.columns?.filter((col) => col !== "Id" && col !== "visualId") || [];

  // -------------------------------
  // Detect if a column is FK
  // -------------------------------
  const isForeignKey = (col) =>
    col.toLowerCase().endsWith("id") && col !== "Id";

  // departmentId → Departments
  const getReferencedTable = (fk) => {
  const base = fk.replace(/Id$/i, "").toLowerCase();

  // Find table whose name (without plural or uppercase) matches
  const match = tables.find((t) =>
      t.name.toLowerCase().replace(/s$/, "") === base
    );

    return match ? match.name : null;
  };


  const getRefColumns = (refTableName) => {
    const t = tables.find((t) => t.name === refTableName);
    if (!t) return [];
    return t.columns.filter(
      (c) => c !== "Id" && c !== "visualId"
    );
  };

  // -------------------------------
  // Handling changes
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

  // Detect field type based on name
  const getColumnType = (column) => {
    const col = column.toLowerCase();

    if (col.includes("date")) return "date";

    if (
      col.includes("cost") ||
      col.includes("score") ||
      col.includes("experience") ||
      col.includes("typeid") ||
      (!col.endsWith("id") && col.match(/(count|total|qty|amount|number)$/i))
    ) {
      return "number";
    }

    return "string";
  };

  const renderTypedInput = (column, value, onChange) => {
    const type = getColumnType(column);

    // For dates
    if (type === "date") {
      return (
        <Input
          type="text"
          placeholder="Ej: >2024-01-01"
          value={value || ""}
          onChange={onChange}
          variant="input-filter"
          showSearchIcon={true}
          onFocus={(e) => {
            if (!value || /^[<>]=?/.test(value)) e.target.type = "date";
          }}
          onBlur={(e) => (e.target.type = "text")}
        />
      );
    }

    // For numbers
    if (type === "number") {
      return (
        <Input
          type="text"
          placeholder="Ej: >5"
          value={value || ""}
          onChange={onChange}
          variant="input-filter"
          showSearchIcon={true}
          onFocus={(e) => {
            if (!value || /^[<>]=?/.test(value)) e.target.type = "number";
          }}
          onBlur={(e) => (e.target.type = "text")}
        />
      );
    }

    // Normal case (string)
    return (
      <Input
        type="text"
        placeholder={`Filter by ${column}...`}
        value={value || ""}
        onChange={onChange}
        variant="input-filter"
        showSearchIcon={true}
      />
    );
  };



  return (
    <div className="filter-panel">
      <Button
        variant={`btn-filter-toggle ${hasActiveFilters ? "has-filters" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={18} />
        {hasActiveFilters && (
          <span className="filter-badge">
            {Object.keys(activeFilters).length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="filter-dropdown">
          <div className="filter-header">
            <h4>Filter Table</h4>
            <Button variant="btn-close" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </Button>
          </div>

          <div className="filter-content">
            {visibleColumns.map((column) => {
              const fk = isForeignKey(column);

              return (
                <div key={column} className="filter-field">
                  <label>{column}:</label>

                  {/* -----------------------
                      Normal case: Simple Input
                  ------------------------ */}
                  {!fk && (
                    <div className="filter-input-container">
                     {renderTypedInput(
                        column,
                        filters[column],
                        (val) => handleFilterChange(column, val)
                      )}
                    </div>
                  )}

                  {/* -----------------------
                      FK case: expandable button
                  ------------------------ */}
                  {fk && (
                    <div className="fk-filter-block">
                      <Button
                        variant="btn-fk-expand"
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
                      </Button>

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
                                  <Input
                                    type="text"
                                    value={filters[key] || ""}
                                    onChange={(val) =>
                                      handleFilterChange(key, val)
                                    }
                                    placeholder={`Filter by ${sc}...`}
                                    variant="input-filter"
                                    showSearchIcon={true}
                                  />
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
            <Button variant="btn-filter-clear" onClick={clearAllFilters} text="Clear All" />
            <Button variant="btn-filter-apply" onClick={applyFilters} text="Apply Filters" />
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="active-filters">
          {Object.entries(activeFilters).map(([column, value]) => (
            <span key={column} className="active-filter-tag">
              {column}: {value}
              <Button variant="btn-remove-filter" onClick={() => removeFilter(column)}>
                <X size={12} />
              </Button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
