import { useState } from 'react';
import '../../styles/components/Input.css';
import { Eye, EyeOff, Search } from "lucide-react";

/**
 * Input Component - Reusable input component
 * 
 * @param {string} type - Input type ("text", "password", "date", "number", etc.)
 * @param {string} value - Input value
 * @param {string} placeholder - Input placeholder
 * @param {function} onChange - Function that receives the new value
 * @param {string} error - Error message to display
 * @param {string} variant - Style variant ("input-default", "input-filter", "input-form", "input-report")
 * @param {boolean} disabled - If true, disables the input
 * @param {boolean} showSearchIcon - If true, shows search icon
 * @param {string} className - Additional CSS classes
 * @param {function} onFocus - Function on focus
 * @param {function} onBlur - Function on blur
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
