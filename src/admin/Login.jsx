import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Para redirigir tras entrar
import "./login.css";

const Login = () => {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        
        // Credenciales de acceso: admin / admin123
        if (usuario.toLowerCase() === "admin" && (password === "admin123" || password === "admin")) {
            alert("Acceso autorizado. Bienvenido al Panel de Control.");
            navigate("/admin/estanterias"); 
        } else {
            alert("Credenciales incorrectas. Verifique sus datos.");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Panel de Administración</h2>
                <p>Ingrese sus credenciales para gestionar el catálogo</p>
                
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Usuario</label>
                        <input 
                            type="text" 
                            value={usuario} 
                            onChange={(e) => setUsuario(e.target.value)} 
                            placeholder="admin"
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="password"
                        />
                    </div>
                    
                    <button type="submit" className="login-btn">Iniciar Sesión</button>
                </form>
            </div>
        </div>
    );
};

export default Login;