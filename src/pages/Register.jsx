import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button/Button.jsx";
import Input from "../components/Input/Input.jsx";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleRegister() {
    if (username && email && password) {
      alert(`Cuenta creada para ${username}`);
      navigate("/dashboard"); // 👈 redirige al dashboard
    } else {
      alert("Por favor completa todos los campos");
    }
  }

  return (
    <div className="register-container">
      <h1>Create your account</h1>

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

      <Button text="Create Account" onClick={handleRegister} variant="register" />

      <div className="back-to-login">
        <p>Do you already have an account?</p>
        <Link to="/">Go to Login</Link>
      </div>
    </div>
  );
}

export default Register;

