import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../Button/Button";
import "../../styles/components/Table.css";

function TableSelector({ tables, onSelect, activeTable }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const updateArrowVisibility = () => {
    const c = scrollContainerRef.current;
    if (!c) return;
    setShowLeftArrow(c.scrollLeft > 0);
    setShowRightArrow(c.scrollLeft < c.scrollWidth - c.clientWidth);
  };

  useEffect(() => {
    updateArrowVisibility();
    window.addEventListener("resize", updateArrowVisibility);
    return () => window.removeEventListener("resize", updateArrowVisibility);
  }, [tables]);

  return (
    <div className="table-selector-container">
      {showLeftArrow && (
        <Button
          variant="btn-nav-arrow left"
          onClick={() =>
            scrollContainerRef.current.scrollBy({
              left: -200,
              behavior: "smooth",
            })
          }
        >
          <ChevronLeft size={20} />
        </Button>
      )}

      <div
        className="table-selector-scroll"
        ref={scrollContainerRef}
        onScroll={updateArrowVisibility}
      >
        <div className="table-segmented-bar">
          {tables.map((table, i) => {
            const isActive = activeTable === table.name;

            return (
              <div
                key={table.name}
                className={`table-segment ${isActive ? "active" : ""}`}
                onClick={() => onSelect(table.name)}
              >
                {/* fondo animado */}
                <span className="segment-bg" />

                {/* texto */}
                <span className="table-segment-text">
                  {table.name}
                </span>

                {/* divisor */}
                {i < tables.length - 1 && (
                  <span className="segment-divider" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showRightArrow && (
        <Button
          variant="btn-nav-arrow right"
          onClick={() =>
            scrollContainerRef.current.scrollBy({
              left: 200,
              behavior: "smooth",
            })
          }
        >
          <ChevronRight size={20} />
        </Button>
      )}
    </div>
  );
}

export default TableSelector;
