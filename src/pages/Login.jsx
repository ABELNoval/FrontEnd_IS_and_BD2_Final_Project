import { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import Button from '../components/Button/Button.jsx'
import Input from '../components/Input/Input.jsx'
import AuthBox from "../components/AuthBox/AuthBox.jsx";

function Login() {
  const [userOrEmail, setUserOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();
  const users = JSON.parse(localStorage.getItem("users")) || [];

  function handleLogin()
  {
    const foundUser = users.find(
      (u) => 
        (u.email === userOrEmail || u.username === userOrEmail) && 
        u.password === password
    )

    if (foundUser) {
      navigate("/dashboard");
    } else {
      alert("Your account is not registered");
    }
  }

   return (
    <div>
      <h1 className="main-title">
        <span className="brand-part ges">Ges</span>
        <span className="brand-part highlight">H</span>
        <span className="brand-part tec">Tec</span>
        <span className="brand-part highlight">K</span>
      </h1>

      <AuthBox title="Log in with your account">
        <Input
          type="text"
          value={userOrEmail}
          placeholder="Enter your user or email"
          onChange={setUserOrEmail}
        />
        <Input
          type="password"
          value={password}
          placeholder="Enter your password"
          onChange={setPassword}
        />
        <Button text="Login" onClick={handleLogin} variant="app-button" />
        <p>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </AuthBox>
    </div>
  );
}

export default Login
