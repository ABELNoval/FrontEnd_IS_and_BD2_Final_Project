import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import Button from '../components/Button/Button.jsx'
import Input from '../components/Input/Input.jsx'
import {isEmpty, isValidEmail, isValidPassword} from '../utils/validators.js'
import '../styles/pages/Login.css'

function Login() {
  const [userOrEmail, setUserOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({
    userOrEmail: "",
    password: "",
  })
  const navigate = useNavigate();
  const users = JSON.parse(localStorage.getItem("users")) || [];

  function handleLogin()
  {
    const newErrors = {
      userOrEmail: "",
      password: "",
    };

    if (isEmpty(userOrEmail)) {
      newErrors.userOrEmail = "User or email is required";
    } else if (
      userOrEmail.includes("@") &&
      !isValidEmail(userOrEmail)
    ) {
      newErrors.userOrEmail = "Invalid email format or your have use @ in your userName";
    }

    if (isEmpty(password)) {
      newErrors.password = "Password is required";
    } else if(
      !isValidPassword(password)
    ) {
      newErrors.password = "Password must be more than 8 characters long."
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    const foundUser = users.find(
      (u) => 
        (u.email === userOrEmail || u.username === userOrEmail) && 
        u.password === password
    )

    if (foundUser) {
      navigate("/dashboard");
    } else {
      newErrors.userOrEmail = "Your account or your password are incorrect";
    }

    setErrors(newErrors);
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
              <h1 className="auth-title">Login with your account</h1>
              <Input
                type="text"
                value={userOrEmail}
                placeholder="Enter your user or email"
                onChange={setUserOrEmail}
                error={errors.userOrEmail}
                />
              <Input
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={setPassword}
                error={errors.password}
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
