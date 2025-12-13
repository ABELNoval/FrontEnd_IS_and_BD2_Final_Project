import { useState } from "react";
import { Settings } from "lucide-react"; // ícono de engranaje
import "../../styles/components/Button.css";

function Button({ text, onClick , variant}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return; // evita clicks dobles
    setLoading(true);

    // Espera la animación (1.2s) antes de ejecutar la acción real
    setTimeout(() => {
      onClick?.();
      setLoading(false);
    }, 1200);
  };

  return (
    <button
      className={variant}
      onClick={handleClick}
      type="button"
    >
      {!loading && <span className="btn-text">{text}</span>}
      {loading && <Settings className="gear-icon" size={22} />}
    </button>
  );
}

export default Button;
