import React from "react";
import Button from "../Button/Button";

function TableSelector({ tables, onSelect, activeTable }) {
  return (
    <div className="table-selector">
      {tables.map((table, index) => (
        <Button
          key={`${table.name}-${index}`} // clave única
          text={table.name}
          variant={`table-button ${activeTable === table.name ? "active" : ""}`}
          onClick={() => {
            console.log("👉 Tabla seleccionada:", table.name);
            onSelect(table.name);
          }}
        />
      ))}
    </div>
  );
}

export default TableSelector;
