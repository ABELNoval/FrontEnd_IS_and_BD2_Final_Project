import { useState } from 'react';
import '../../styles/components/Input.css';
import { Eye, EyeOff, Search } from "lucide-react";

/**
 * Input Component - Componente de input reutilizable
 * 
 * @param {string} type - Tipo de input ("text", "password", "date", "number", etc.)
 * @param {string} value - Valor del input
 * @param {string} placeholder - Placeholder del input
 * @param {function} onChange - Función que recibe el nuevo valor
 * @param {string} error - Mensaje de error a mostrar
 * @param {string} variant - Variante de estilo ("input-default", "input-filter", "input-form", "input-report")
 * @param {boolean} disabled - Si true, desactiva el input
 * @param {boolean} showSearchIcon - Si true, muestra icono de búsqueda
 * @param {string} className - Clases CSS adicionales
 * @param {function} onFocus - Función al hacer focus
 * @param {function} onBlur - Función al perder focus
 */
function Input({ 
  type = "text", 
  value, 
  placeholder, 
  onChange, 
  error = "",
  variant = "input-default",
  disabled = false,
  showSearchIcon = false,
  className = "",
  onFocus,
  onBlur
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const wrapperClass = `input-wrapper ${variant}-wrapper ${className}`.trim();
  const containerClass = `input-container ${variant}-container ${showSearchIcon ? 'has-search-icon' : ''}`.trim();
  const inputClass = `input ${variant} ${error ? 'has-error' : ''}`.trim();

  return (
    <div className={wrapperClass}>
      <div className={containerClass}>
        {showSearchIcon && (
          <Search size={14} className="input-search-icon" />
        )}
        <input
          type={(isPassword && showPassword) ? 'text' : type}
          className={inputClass}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
        />

        {isPassword && (
          <button
            type="button"
            className="button-toggle"
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {variant === "input-default" && (
        <div className="input-error">
          {error}
        </div>
      )}
      
      {variant !== "input-default" && error && (
        <div className="input-error">
          {error}
        </div>
      )}
    </div>
  );
}

export default Input;
