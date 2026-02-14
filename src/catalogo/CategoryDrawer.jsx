import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";
import { API_URL } from "../apiConfig";
import { kmpSearch } from "../utils/kmp";
import "./catalogo.css";

const CategoryDrawer = ({ categoryId, categoryName, isOpen, onClose }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (isOpen && categoryId) {
            setLoading(true);
            setSearch("");
            fetch(`${API_URL}/inventory/category/${categoryId}/products`)
                .then(res => res.json())
                .then(data => {
                    setProducts(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error cargando productos de categoría", err);
                    setProducts([]);
                    setLoading(false);
                });
        }
    }, [isOpen, categoryId]);

    const filteredProducts = useMemo(() => {
        if (!search) return products;
        return products.filter(p => kmpSearch(p.nombre, search));
    }, [products, search]);

    // Bloquear scroll del body cuando el drawer está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <>
            {/* Overlay oscuro */}
            <div 
                className={`drawer-overlay ${isOpen ? 'open' : ''}`} 
                onClick={onClose}
            />
            
            {/* Panel lateral */}
            <div className={`category-drawer ${isOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <button className="drawer-close" onClick={onClose}>✕</button>
                    <h2 className="drawer-title">{categoryName}</h2>
                    <div className="drawer-search">
                        <input 
                            type="text"
                            placeholder="Buscar en esta categoría..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="drawer-products">
                    {loading ? (
                        <p className="drawer-loading">Cargando productos...</p>
                    ) : filteredProducts.length > 0 ? (
                        <div className="drawer-grid">
                            {filteredProducts.map(product => (
                                <ProductCard 
                                    key={product.id}
                                    name={product.nombre} 
                                    quantity={product.cantidad} 
                                    price={product.precio} 
                                    imagenUrl={product.imagenUrl} 
                                    esCombo={product.esCombo}
                                    esOferta={product.esOferta}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="drawer-empty">
                            {search ? "No se encontraron productos." : "Esta categoría no tiene productos."}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default CategoryDrawer;
