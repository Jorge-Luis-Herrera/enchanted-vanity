// Estante scrolleable

import React, { Component } from "react";
import ProductCard from "./ProductCard";
import "./catalogo.css";

class ShelfRow extends Component {
    render() {
        // Extraemos "productos" de las props (debe llamarse igual que en main.jsx)
        const { title, productos } = this.props;

        return (
            <div className="shelf-container">
                <h2 className="shelf-title">{title}</h2>
                <div className="shelf-row">
                    {productos && productos.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            name={product.nombre} 
                            quantity={product.cantidad} 
                            price={product.precio} 
                            imagenUrl={product.imagenUrl} 
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default ShelfRow;