import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import Button from '../components/Button/Button.jsx'
import Input from '../components/Input/Input.jsx'
import {isEmpty, isValidEmail, isValidPassword} from '../utils/validators.js'
import authService from '../services/authService.js'
import { getRoleRedirectPath } from '../utils/roleUtils.js'
import '../styles/pages/Login.css'

function Login() {
  const [userOrEmail, setUserOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({
    userOrEmail: "",
    password: "",
  })
  const navigate = useNavigate();

  async function handleLogin()
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

    setIsLoading(true);

    try {
      const authData = await authService.login(userOrEmail, password);

      // Defensive: ensure response contains token and user
      const token = authData?.token || authData?.Token;
      const user = authData?.user || authData?.User;
      if (!token || !user) {
        newErrors.userOrEmail = "Authentication failed. Please check your credentials.";
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      authService.saveAuth(authData);
      // Get user role and redirect to appropriate dashboard
      const role = user?.role || user?.Role;
      const redirectPath = getRoleRedirectPath(role);
      navigate(redirectPath);
    } catch (error) {
      if (error.response?.status === 401) {
        newErrors.userOrEmail = "Your account or your password are incorrect";
      } else if (error.response?.data?.message) {
        newErrors.userOrEmail = error.response.data.message;
      } else {
        newErrors.userOrEmail = "Connection error. Please try again.";
      }
      setErrors(newErrors);
    } finally {
      setIsLoading(false);
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
              <Button 
                text={isLoading ? "Loading..." : "Login"} 
                onClick={handleLogin} 
                variant="btn-base" 
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login
