import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Proveedor/login";
import Dashboard from "./pages/Proveedor/Dashboard";
import Landing from "./pages/Cliente/Landing";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para el Cliente (Landing Page) */}
        <Route path="/" element={<Landing />} />

        {/* Ruta para el Proveedor (Login) */}
        <Route path="/login" element={<Login />} />

        {/* Rutas para el Proveedor (Dashboard) */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App;
