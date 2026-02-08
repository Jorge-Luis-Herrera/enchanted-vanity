import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./header/header";
import ShelfRow from "./catalogo/ShelfRow"; 
import Footer from "./footer/footer";
import Login from "./admin/Login"; 
import AdminLayout from "./admin/AdminLayout";
import AdminShelves from "./admin/AdminShelves";
import AdminProducts from "./admin/AdminProducts"; // Importamos Gestión Productos
import { API_URL } from "./apiConfig";
import "./index.css";

const Tienda = () => {
    const [inventario, setInventario] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/inventory`)
            .then(res => res.json())
            .then(data => {
                setInventario(data);
                setCargando(false);
            })
            .catch((err) => {
                console.error("Error al conectar con el servidor:", err);
                setCargando(false);
            });
    }, []);

    return (
        <div className="app-container">
            <Header />
            <main style={{ minHeight: "80vh", padding: "120px 0 20px 0" }}>
                {cargando ? (
                    <p style={{ textAlign: "center", color: "var(--accent-gold)" }}>Cargando catálogo de productos...</p>
                ) : (
                    inventario.length > 0 ? (
                        inventario.map(s => (
                            <ShelfRow key={s.id} title={s.titulo} productos={s.productos} />
                        ))
                    ) : (
                        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>No hay secciones disponibles en este momento.</p>
                    )
                )}
            </main>
            <Footer />
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Tienda />} />
                <Route path="/login" element={<Login />} />
                
                {/* Rutas Administrativas Protegidas */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="estanterias" element={<AdminShelves />} />
                    <Route path="productos" element={<AdminProducts />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const rootElement = document.getElementById("root");
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}

