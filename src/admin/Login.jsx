import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../apiConfig";
import { setToken } from "../utils/auth";
import "./login.css";

const Login = () => {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        const usuarioTrim = usuario.trim();
        if (!usuarioTrim) {
            setError("El usuario no puede estar vacío.");
            return;
        }
        if (!password) {
            setError("La contraseña no puede estar vacía.");
            return;
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario: usuarioTrim, password }),
            });
            const text = await res.text();
            let data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                setError("Error en el servidor. Verifique que el backend esté corriendo en el puerto 3000.");
                return;
            }
            if (data.ok && data.access_token) {
                setToken(data.access_token);
                alert("Acceso autorizado. Bienvenido al Panel de Control.");
                navigate("/admin/estanterias");
            } else {
                setError(data.message || "Credenciales incorrectas. Verifique sus datos.");
            }
        } catch (err) {
            setError("Error de conexión. Asegúrese de que el backend esté activo (cd backend && npm run start:dev).");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Panel de Administración</h2>
                <p>Ingrese sus credenciales para gestionar el catálogo</p>

                <form onSubmit={handleLogin}>
                    {error && <p className="login-error">{error}</p>}
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

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Verificando..." : "Iniciar Sesión"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;