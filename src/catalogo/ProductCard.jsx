import React, { useState } from "react";
import { createPortal } from "react-dom";
import { STATIC_URL } from "../apiConfig";
import "./catalogo.css";

const ProductCard = ({ name, quantity, price, imagenUrl, esCombo, esOferta, isBestSeller, descripcion }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [compraCantidad, setCompraCantidad] = useState(1);

    // Ruta base del backend para las imágenes
    const fullImgUrl = imagenUrl
        ? (imagenUrl.startsWith('http') ? imagenUrl : `${STATIC_URL}${imagenUrl}`)
        : null;

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
                className={`product-card ${(esCombo || esOferta || isBestSeller) ? "product-card-featured" : ""}`}

                onClick={() => setIsOpen(true)}
                style={{
                    backgroundImage: fullImgUrl ? `url(${fullImgUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer'
                }}
            >
                {(esCombo || esOferta || isBestSeller) && (
                    <div className="product-badges">
                        {esCombo && <span className="badge badge-combo">Combo</span>}
                        {esOferta && <span className="badge badge-oferta">Oferta</span>}
                        {isBestSeller && <span className="badge badge-best-seller">Más Vendido</span>}
                    </div>
                )}

                <div className="card-glass-overlay">
                    <div className="product-info">
                        <h3>{name}</h3>
                        <p className="quantity">Stock: {quantity} unidades</p>
                        <p className="price">${price}</p>
                    </div>
                </div>
            </div>

            {/* Modal de Detalle Avanzado (Efecto 3D) */}
            {isOpen && createPortal(
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
                                        <span>${price}</span>
                                    </div>
                                    <div className="stat">
                                        <label>Existencias</label>
                                        <span>{quantity} disponibles</span>
                                    </div>
                                    <div className="stat">
                                        <label>Cantidad a comprar</label>
                                        <div className="quantity-selector">
                                            <button onClick={() => setCompraCantidad(Math.max(1, compraCantidad - 1))}>-</button>
                                            <input
                                                type="number"
                                                value={compraCantidad}
                                                onChange={(e) => setCompraCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                                            />
                                            <button onClick={() => setCompraCantidad(compraCantidad + 1)}>+</button>
                                        </div>
                                    </div>
                                </div>
                                {descripcion ? (
                                    <p className="description">{descripcion}</p>
                                ) : (
                                    <p className="description-placeholder">Este producto ya está disponible en nuestra colección exclusiva.</p>
                                )}

                                <a
                                    href={`https://wa.me/5356126873?text=${encodeURIComponent(`Hola, me interesa comprar ${compraCantidad} unidad(es) de: ${name}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="action-btn"
                                >
                                    Adquirir Ahora
                                </a>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Vista de Imagen Expandida (Full Screen) */}
            {isExpanded && createPortal(
                <div className="fullscreen-image-overlay" onClick={() => setIsExpanded(false)}>
                    <button className="close-expanded" onClick={() => setIsExpanded(false)}>&times;</button>
                    <img src={fullImgUrl} alt={name} className="expanded-image" />
                </div>,
                document.body
            )}
        </>
    );
};

export default ProductCard;