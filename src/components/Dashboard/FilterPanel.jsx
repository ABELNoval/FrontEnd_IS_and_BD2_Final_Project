import React, { useState } from "react";
import { Filter, X, Search } from "lucide-react";
import "./FilterPanel.css";

function FilterPanel({ table, onFilter, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({});

  const visibleColumns = table?.columns?.filter((col) => col !== "id") || [];

  const handleFilterChange = (column, value) => {
    const newFilters = { ...filters };
    if (value.trim() === '') {
      delete newFilters[column];
    } else {
      newFilters[column] = value;
    }
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
    if (typeof onFilter === 'function') {
      onFilter(filters);
    }
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    setFilters({});
    setActiveFilters({});
    if (typeof onClear === 'function') {
      onClear();
    }
    setIsOpen(false);
  };

  const removeFilter = (column) => {
    const newFilters = { ...filters };
    delete newFilters[column];
    setFilters(newFilters);
    
    const newActiveFilters = { ...activeFilters };
    delete newActiveFilters[column];
    setActiveFilters(newActiveFilters);
    if (typeof onFilter === 'function') {
      onFilter(newActiveFilters);
    }
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="filter-panel">
      <button 
        className={`filter-toggle ${hasActiveFilters ? 'has-filters' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={18} />
        {hasActiveFilters && <span className="filter-badge">{Object.keys(activeFilters).length}</span>}
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
            {visibleColumns.map(column => (
              <div key={column} className="filter-field">
                <label>{column}:</label>
                <div className="filter-input-container">
                  <Search size={14} className="search-icon" />
                  <input
                    type="text"
                    value={filters[column] || ''}
                    onChange={(e) => handleFilterChange(column, e.target.value)}
                    placeholder={`Filter by ${column}...`}
                    className="filter-input"
                  />
                </div>
              </div>
            ))}
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

      {/* Mostrar filtros activos */}
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