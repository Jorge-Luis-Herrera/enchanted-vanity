// Estante scrolleable — muestra Categorías o Productos (featured)

import React, { useRef } from "react";
import ProductCard from "./ProductCard";
import CategoryCard from "./CategoryCard";
import fondoFeatured from "../assets/2.png";
import "./catalogo.css";

const ShelfRow = ({ title, subtitle, items, isFeatured, onCategoryClick }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const itemWidth = container.firstChild ? container.firstChild.clientWidth : container.clientWidth;
            const scrollTo = direction === "left" 
                ? container.scrollLeft - itemWidth 
                : container.scrollLeft + itemWidth;
            container.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <section className={`shelf-container ${isFeatured ? 'featured-shelf' : ''}`}>
            <div className="shelf-header">
                {isFeatured && subtitle && <p className="hero-subtitle">{subtitle}</p>}
                <h2 className="shelf-title">{title}</h2>
            </div>
            
            <div className="shelf-wrapper">
                {isFeatured && (
                    <button className="nav-btn prev" onClick={() => scroll("left")} aria-label="Anterior">❮</button>
                )}
                
                <div className={`shelf-row ${isFeatured ? "featured" : ""}`} ref={scrollRef}>
                    {items && items.map((item) => (
                        <div className={isFeatured ? "carousel-item" : "shelf-item"} key={item.id}>
                            {isFeatured ? (
                                // Banner de combos/ofertas: mostramos ProductCard con badges
                                <ProductCard 
                                    name={item.nombre} 
                                    quantity={item.cantidad} 
                                    price={item.precio} 
                                    imagenUrl={item.imagenUrl}
                                    esCombo={item.esCombo}
                                    esOferta={item.esOferta}
                                />
                            ) : (
                                // Estanterías normales: mostramos CategoryCard
                                <CategoryCard 
                                    nombre={item.nombre}
                                    imagenUrl={item.imagenUrl}
                                    onClick={() => onCategoryClick && onCategoryClick(item.id, item.nombre)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {isFeatured && (
                    <button className="nav-btn next" onClick={() => scroll("right")} aria-label="Siguiente">❯</button>
                )}
            </div>
        </section>
    );
};

export default ShelfRow;