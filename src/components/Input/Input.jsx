import { useState } from 'react';
import '../../styles/components/Input.css';
import { Eye, EyeOff } from "lucide-react";

function Input({ type = "text", value, placeholder, onChange, error = "" }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="input-wrapper">
      <div className="input-container">
        <input
          type={(isPassword && showPassword) ? 'text' : type}
          className="input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
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

      <div className="input-error">
        {error}
      </div>
    </div>
  );
}

export default Input;
