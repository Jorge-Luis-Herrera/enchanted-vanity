import React from "react";
import { STATIC_URL } from "../apiConfig";
import "./catalogo.css";

const CategoryCard = ({ nombre, imagenUrl, onClick }) => {
    const fullImgUrl = imagenUrl ? `${STATIC_URL}${imagenUrl}` : null;

    return (
        <div 
            className="category-card" 
            onClick={onClick}
            style={{ 
                backgroundImage: fullImgUrl ? `url(${fullImgUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="category-glass-overlay">
                <h3 className="category-name">{nombre}</h3>
            </div>
        </div>
    );
};

export default CategoryCard;
