import { useState } from "react";
import { Settings } from "lucide-react"; // ícono de engranaje
import "../../styles/components/Button.css";

/**
 * Button Component - Componente de botón reutilizable
 * 
 * @param {string} text - Texto del botón (opcional si se usa children)
 * @param {function} onClick - Función a ejecutar al hacer clic
 * @param {string} variant - Clase CSS para el estilo (ej: "btn-base", "btn-icon", "btn-filter", etc.)
 * @param {boolean} loading - Si true, muestra animación de carga (por defecto true para btn-base)
 * @param {boolean} disabled - Si true, desactiva el botón
 * @param {string} type - Tipo de botón ("button", "submit", "reset")
 * @param {React.ReactNode} children - Contenido del botón (alternativa a text)
 * @param {string} className - Clases CSS adicionales
 */
function Button({ 
  text, 
  onClick, 
  variant = "btn-base",
  loading: externalLoading,
  disabled = false,
  type = "button",
  children,
  className = ""
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  
  // Solo usar animación de carga para variantes base
  const useLoadingAnimation = variant.includes("btn-base") && !variant.includes("btn-icon") && !variant.includes("btn-simple");
  const isLoading = useLoadingAnimation && internalLoading;

  const handleClick = async (e) => {
    if (disabled || isLoading) return;
    
    if (useLoadingAnimation) {
      setInternalLoading(true);
      // Espera la animación (1.2s) antes de ejecutar la acción real
      setTimeout(() => {
        onClick?.(e);
        setInternalLoading(false);
      }, 1200);
    } else {
      // Ejecución inmediata sin animación
      onClick?.(e);
    }
  };

  const combinedClassName = `${variant} ${className} ${isLoading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`.trim();

  return (
    <button
      className={combinedClassName}
      onClick={handleClick}
      type={type}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Settings className="gear-icon" size={22} />
      ) : (
        children || <span className="btn-text">{text}</span>
      )}
    </button>
  );
}

export default Button;
