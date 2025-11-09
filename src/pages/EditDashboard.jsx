import { useNavigate } from "react-router-dom";
import Button from "../components/Button/Button";


function EditDashboard() {
    const navigate = useNavigate()
    
    function Back(){
        navigate("/dashboard")
    }

    return (
        <div>
            <Button text="Back" variant="back" onClick={Back}/>
        </div>
    )
}
export default EditDashboard;
