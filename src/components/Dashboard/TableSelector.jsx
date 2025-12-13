import React, { useRef, useState } from "react";
import Button from "../Button/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/components/Table.css";

function TableSelector({ tables, onSelect /*activeTable*/ }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      const newScrollLeft = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      // Actualizar visibilidad de flechas después de la animación
      setTimeout(() => updateArrowVisibility(), 300);
    }
  };

  const updateArrowVisibility = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < (container.scrollWidth - container.clientWidth));
    }
  };

  // Actualizar visibilidad cuando cambia el tamaño de la ventana o las tablas
  React.useEffect(() => {
    updateArrowVisibility();
    window.addEventListener('resize', updateArrowVisibility);
    return () => window.removeEventListener('resize', updateArrowVisibility);
  }, [tables]);

  return (
    <div className="table-selector-container">
      {showLeftArrow && (
        <button className="nav-arrow left-arrow" onClick={() => scroll('left')}>
          <ChevronLeft size={20} />
        </button>
      )}
      
      <div 
        className="table-selector-scroll"
        ref={scrollContainerRef}
        onScroll={updateArrowVisibility}
      >
        <div className="table-selector">
          {tables.map((table, index) => (
            <Button
              key={`${table.name}-${index}`}
              text={table.name}
              variant="btn-base"
              onClick={() => {
                console.log("👉 Tabla seleccionada:", table.name);
                onSelect(table.name);
              }}
            />
          ))}
        </div>
      </div>

      {showRightArrow && (
        <button className="nav-arrow right-arrow" onClick={() => scroll('right')}>
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}

export default TableSelector;