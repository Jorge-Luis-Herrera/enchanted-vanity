import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./header/header";
import ShelfRow from "./catalogo/ShelfRow";
import CategoryDrawer from "./catalogo/CategoryDrawer";
import Footer from "./footer/footer";
import Login from "./admin/Login"; 
import AdminLayout from "./admin/AdminLayout";
import AdminShelves from "./admin/AdminShelves";
import AdminCategories from "./admin/AdminCategories";
import AdminProducts from "./admin/AdminProducts";
import ProtectedRoute from "./admin/ProtectedRoute";
import { API_URL } from "./apiConfig";
import { kmpSearch } from "./utils/kmp";
import "./index.css";

const Tienda = () => {
    const [inventario, setInventario] = useState([]); // Shelf[] con categorias[]
    const [destacados, setDestacados] = useState([]); // Productos combo/oferta
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    // Estado del drawer lateral
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState({ id: null, nombre: "" });

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/inventory`).then(res => {
                if (!res.ok) throw new Error("Error cargando inventario");
                return res.json();
            }),
            fetch(`${API_URL}/inventory/featured`).then(res => {
                if (!res.ok) throw new Error("Error cargando destacados");
                return res.json();
            }),
        ])
        .then(([inv, feat]) => {
            setInventario(Array.isArray(inv) ? inv : []);
            setDestacados(Array.isArray(feat) ? feat : []);
            setCargando(false);
        })
        .catch((err) => {
            console.error("Error al conectar con el servidor:", err);
            setCargando(false);
        });
    }, []);

    // Filtrar categorías por nombre del producto o de la categoría cuando hay búsqueda
    const inventarioFiltrado = useMemo(() => {
        if (!busqueda) return inventario;
        return inventario.map(shelf => ({
            ...shelf,
            categorias: shelf.categorias?.filter(c => 
                kmpSearch(c.nombre, busqueda) || 
                (c.productos && c.productos.some(p => kmpSearch(p.nombre, busqueda)))
            ) || []
        })).filter(shelf => shelf.categorias.length > 0);
    }, [inventario, busqueda]);

    // Lista final: banner de destacados + estanterías con categorías
    const inventarioAMostrar = useMemo(() => {
        const lista = [];

        // Banner de combos/ofertas solo si no hay búsqueda y hay productos destacados
        if (!busqueda && destacados.length > 0) {
            lista.push({ 
                id: 'featured-shelf', 
                titulo: 'Combos y ofertas destacadas !!!', 
                subtitulo: 'Selección exclusiva para ti',
                items: destacados, 
                isFeatured: true 
            });
        }

        // Estanterías normales con sus categorías como items
        inventarioFiltrado.forEach(shelf => {
            if (shelf.categorias && shelf.categorias.length > 0) {
                lista.push({
                    id: shelf.id,
                    titulo: shelf.titulo,
                    items: shelf.categorias,
                    isFeatured: false,
                });
            }
        });

        return lista;
    }, [inventarioFiltrado, destacados, busqueda]);

    const handleCategoryClick = (categoryId, categoryName) => {
        setSelectedCategory({ id: categoryId, nombre: categoryName });
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
    };

    return (
        <div className="app-container">
            <Header onSearch={setBusqueda} />
            <main className="main-content">
                {cargando ? (
                    <p style={{ textAlign: "center", color: "var(--accent-pink)" }}>Cargando catálogo de productos...</p>
                ) : (
                    inventarioAMostrar.length > 0 ? (
                        inventarioAMostrar.map(s => (
                            <ShelfRow 
                                key={s.id} 
                                title={s.titulo} 
                                subtitle={s.subtitulo}
                                items={s.items} 
                                isFeatured={s.isFeatured}
                                onCategoryClick={handleCategoryClick}
                            />
                        ))
                    ) : (
                        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
                            {busqueda ? "No se encontraron categorías coincidentes." : "No hay secciones disponibles en este momento."}
                        </p>
                    )
                )}
            </main>

            {/* Drawer lateral para productos de categoría */}
            <CategoryDrawer 
                categoryId={selectedCategory.id}
                categoryName={selectedCategory.nombre}
                isOpen={drawerOpen}
                onClose={handleCloseDrawer}
            />

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
                
                {/* Rutas Administrativas */}
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                    <Route path="estanterias" element={<AdminShelves />} />
                    <Route path="categorias" element={<AdminCategories />} />
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

