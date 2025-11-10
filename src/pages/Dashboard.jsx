import { useNavigate } from "react-router-dom";
import Button from "../components/Button/Button";

function Dashboard() {
    const navigate = useNavigate()
  
    function handleEditDashboard(){
        navigate("/edit")
    }

    function handleLogout(){
        navigate("/")
    }

    return (
        <div>
            <Button text="editTable" onClick={handleEditDashboard} variant="edit"></Button>
            <Button text="Logout" onClick={handleLogout} variant="logout"></Button>
        </div>
    )
}

export default Dashboard;
