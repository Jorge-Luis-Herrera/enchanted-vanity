import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Por ahora solo redirigimos, luego limpiaremos el token
        navigate("/");
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Panel Admin</h2>
                    <p>Enchanted Vanity</p>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin/estanterias" className="nav-item">Estanterías</Link>
                    <Link to="/admin/productos" className="nav-item">Productos</Link>
                    <Link to="/" className="nav-item return-shop">Ver Tienda</Link>
                </nav>
                <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
            </aside>
            <main className="admin-content">
                <Outlet /> {/* Aquí se cargarán las páginas de estanterías o productos */}
            </main>
        </div>
    );
};

export default AdminLayout;
