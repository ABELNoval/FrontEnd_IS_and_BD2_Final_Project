import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button/Button.jsx";
import Input from "../components/Input/Input.jsx";
import AuthBox from "../components/AuthBox/AuthBox.jsx";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="main-title">
        <span className="brand-part ges">Ges</span>
        <span className="brand-part highlight">H</span>
        <span className="brand-part tec">Tec</span>
        <span className="brand-part highlight">K</span>
      </h1>
        <AuthBox title="Create your account">
        <Input
            type="text"
            value={username}
            placeholder="Enter your username"
            onChange={setUsername}
        />
        <Input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={setEmail}
        />
        <Input
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={setPassword}
        />
        <Button
            text="Create Account"
            onClick={() => handleRegister(username, email, password, navigate)}
            variant="app-button"
        />
        <p>
            Already have an account? <Link to="/">Login</Link>
        </p>
        </AuthBox>
    </div>
  );
}

function handleRegister(username, email, password, navigate) {
    if (!username || !email || !password) {
        alert("Por favor completa todos los campos");
    return;
    }
     const validation = Validation(username, email, password)
    if (validation) {
        navigate("/dashboard");
    }
}

function Validation(username, email, password){
    const normalizedEmail = email.toLowerCase();
    const gmailRegex = /^[a-z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(normalizedEmail)) {
      alert("El correo debe ser un Gmail válido (example@gmail.com)");
      return false;
    }
     if (password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres");
      return false;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const existingUser = users.find(
      (u) => u.username === username || u.email === email
    );

    if (existingUser) {
      alert("El usuario o el email ya existen");
      return false;
    }

    const newUser = { username, email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    return true;
}

export default Register;

