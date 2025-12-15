// Panel.jsx - VERSIÓN MEJORADA Y FLEXIBLE
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "../../styles/components/Panel.css";

function Panel({
  open,
  onClose,
  children,
  className = "",
  style = {},
  closeOnOutside = true,
  closeOnEsc = true,
  portal = false,
  position = "right",
  fullHeight = false,
  fullWidth = false
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        closeOnOutside &&
        panelRef.current &&
        !panelRef.current.contains(e.target)
      ) {
        onClose?.();
      }
    };

    const handleKeyDown = (e) => {
      if (closeOnEsc && e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, closeOnOutside, closeOnEsc]);

  if (!open) return null;

  // 👇 Clases CSS según la posición
  const positionClass = `panel-${position}`;
  const sizeClass = `${fullHeight ? 'panel-full-height' : ''} ${fullWidth ? 'panel-full-width' : ''}`.trim();

  const panelContent = (
    <div 
      ref={panelRef} 
      className={`panel-base ${positionClass} ${sizeClass} ${className}`}
      style={style}
      open={open ? 'true' : undefined}
    >
      {children}
    </div>
  );

  // Si portal=true, renderizar fuera del árbol normal
  if (portal) {
    return createPortal(panelContent, document.body);
  }

  return panelContent;
}

export default Panel;