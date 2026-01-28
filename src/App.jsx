import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Admin Dashboard - only Administrators */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Director Dashboard */}
        <Route path="/director" element={
          <ProtectedRoute allowedRoles={["Director"]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Responsible Dashboard */}
        <Route path="/responsible" element={
          <ProtectedRoute allowedRoles={["Responsible"]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Technical Dashboard */}
        <Route path="/technical" element={
          <ProtectedRoute allowedRoles={["Technical"]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Employee Dashboard */}
        <Route path="/employee" element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Receptor Dashboard - confirms reception of decommissioned equipment */}
        <Route path="/receptor" element={
          <ProtectedRoute allowedRoles={["Receptor"]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Legacy route - redirects based on role */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
