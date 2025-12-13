import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import Button from '../components/Button/Button.jsx'
import Input from '../components/Input/Input.jsx'
import '../styles/pages/Login.css'

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
    <div className='login-bg'>
      <div className= 'login-wrapper'>
        <h1 className="main-title">
          <span className="brand-part ges">Ges</span>
          <span className="brand-part highlight">H</span>
          <span className="brand-part tec">Tec</span>
          <span className="brand-part highlight">K</span>
        </h1>
        <div className='auth-container'>
          <div className="auth-shell">
            <div className="auth-box">
              <h1 className="auth-title">Log in with your account</h1>
              <Input
                type="text"
                value={userOrEmail}
                placeholder="Enter your user or email"
                onChange={setUserOrEmail}
                error=""
                />
              <Input
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={setPassword}
                error=""
                />
              <Button text="Login" onClick={handleLogin} variant="btn-base" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login
