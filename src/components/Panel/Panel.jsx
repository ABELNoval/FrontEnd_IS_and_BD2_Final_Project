import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function Panel({
  open,
  onClose,
  children,
  className = "",
  style = {},
  closeOnOutside = true,
  closeOnEsc = true,
  portal = false
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

  const panelContent = (
    <div 
      ref={panelRef} 
      className={`${className} ${open ? 'open' : ''}`}
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