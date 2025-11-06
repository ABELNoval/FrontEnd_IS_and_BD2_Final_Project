import { useState } from 'react'
import './App.css'
import Button from './components/Button/Button.jsx'
import Input from './components/Input/Input.jsx'

function App() {
  const [userOrEmail, setUserOrEmail] = useState("")
  const [password, setPassword] = useState("")

  function Login()
  {
    return alert("Te has logueado con" + " " + userOrEmail + "y tu contrasena es" + " " + password)
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
      <Button text = "Login" onClick={Login} variant="login"/>  
    </div>
  )
}

export default App
