//import { useState } from 'react'
import { useState } from 'react';
import './Input.css'
import { Eye, EyeOff } from "lucide-react";


function Input({type = "text", value, placeholder, onChange})
{
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const isPassword = type === "password";
    return (
        <div className="input-container">
            <input
                type= {(isPassword && showPassword)? 'text' : type} 
                className="input"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
            {isPassword && (
                <button type='button' className='button-toggle' onClick={toggleVisibility}>
                    {showPassword? <EyeOff size={20} /> : <Eye size={20} />} 
                </button>
            )}
        </div>
    );
}

export default Input