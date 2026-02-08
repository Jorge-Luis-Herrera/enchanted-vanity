import React, { useState } from "react";
import { STATIC_URL } from "../apiConfig";
import "./catalogo.css";

const ProductCard = ({ name, quantity, price, imagenUrl }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Ruta base del backend para las imágenes
    const fullImgUrl = imagenUrl ? `${STATIC_URL}${imagenUrl}` : null;

    // Bloquear scroll cuando el modal está abierto
    React.useEffect(() => {
        if (isOpen || isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, isExpanded]);

    return (
        <>
            <div 
                className="product-card" 
                onClick={() => setIsOpen(true)}
                style={{ 
                    backgroundImage: fullImgUrl ? `url(${fullImgUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer'
                }}
            >
                <div className="card-glass-overlay">
                    <div className="product-info">
                        <h3>{name}</h3>
                        <p className="quantity">Stock: {quantity} unidades</p>
                        <p className="price">${price}</p>
                    </div>
                </div>
            </div>

            {/* Modal de Detalle Avanzado (Efecto 3D) */}
            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="modal-content-3d" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setIsOpen(false)}>&times;</button>
                        
                        <div className="modal-body">
                            <div className="image-container-3d" onClick={() => setIsExpanded(true)}>
                                {fullImgUrl ? (
                                    <img 
                                        src={fullImgUrl} 
                                        alt={name} 
                                        className="main-image-3d" 
                                        title="Click para ampliar"
                                    />
                                ) : (
                                    <div className="no-image-placeholder">Sin Imagen</div>
                                )}
                                <div className="click-hint">Toca para ampliar</div>
                            </div>
                            
                            <div className="details-section">
                                <h2>{name}</h2>
                                <div className="stats-grid">
                                    <div className="stat">
                                        <label>Valor Unitario</label>
                                        <span>{price} monedas</span>
                                    </div>
                                    <div className="stat">
                                        <label>Existencias</label>
                                        <span>{quantity} disponibles</span>
                                    </div>
                                </div>
                                <p className="description">
                                    Este producto forma parte del inventario exclusivo de Enchanted Vanity. 
                                    Garantizamos la máxima calidad en cada pieza del catálogo.
                                </p>
                                <button className="action-btn">Adquirir Ahora</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Vista de Imagen Expandida (Full Screen) */}
            {isExpanded && (
                <div className="fullscreen-image-overlay" onClick={() => setIsExpanded(false)}>
                    <button className="close-expanded" onClick={() => setIsExpanded(false)}>&times;</button>
                    <img src={fullImgUrl} alt={name} className="expanded-image" />
                </div>
            )}
        </>
    );
};

export default ProductCard;