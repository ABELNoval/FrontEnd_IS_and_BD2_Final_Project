import { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import Button from '../components/Button/Button.jsx'
import Input from '../components/Input/Input.jsx'
import './Login.css'

function Login() {
  const [userOrEmail, setUserOrEmail] = useState("")
  const [password, setPassword] = useState("")
   const navigate = useNavigate();

  function handleLogin()
  {
    if (userOrEmail && password) {
      alert(`Welcome ${userOrEmail}!`)
      navigate("/dashboard");
    } else {
      alert("Por favor completa todos los campos");
    }
  }

  return (
    <div>
      <h1>"Welcome"</h1>
      <Input 
        type = "text"
        value={userOrEmail}
        placeholder = "insert your user or email"
        onChange={setUserOrEmail}
      /> 
      <Input
        type="password"
        value={password}
        placeholder="insert your password"
        onChange={setPassword}
      />
      <div className="create-account-section">
        <p>Don't have an account yet?</p>
        <Link to="/register">Create new account</Link>
      </div>
      <Button text = "Login" onClick={handleLogin} variant="login"/>
    </div>
  )
}

export default Login
