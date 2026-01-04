import { useState } from "react";
import { Settings } from "lucide-react"; // gear icon
import "../../styles/components/Button.css";

/**
 * Button Component - Reusable button component
 * 
 * @param {string} text - Button text (optional if using children)
 * @param {function} onClick - Function to execute on click
 * @param {string} variant - CSS class for styling (e.g.: "btn-base", "btn-icon", "btn-filter", etc.)
 * @param {boolean} loading - If true, shows loading animation (default true for btn-base)
 * @param {boolean} disabled - If true, disables the button
 * @param {string} type - Button type ("button", "submit", "reset")
 * @param {React.ReactNode} children - Button content (alternative to text)
 * @param {string} className - Additional CSS classes
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
  
  // Only use loading animation for base variants
  const useLoadingAnimation = variant.includes("btn-base") && !variant.includes("btn-icon") && !variant.includes("btn-simple");
  const isLoading = useLoadingAnimation && internalLoading;

  const handleClick = async (e) => {
    if (disabled || isLoading) return;
    
    if (useLoadingAnimation) {
      setInternalLoading(true);
      // Wait for animation (1.2s) before executing the real action
      setTimeout(() => {
        onClick?.(e);
        setInternalLoading(false);
      }, 1200);
    } else {
      // Immediate execution without animation
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
