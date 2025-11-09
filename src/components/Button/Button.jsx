import React from "react";
import './Button.css'

function Button({text, onClick, variant})
{
    const className = `.btn ${variant}`
    return <button onClick={onClick} className={className}>{text}</button>
}

export default Button