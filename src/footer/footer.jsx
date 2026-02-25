import React, { useState } from "react";
import { createPortal } from "react-dom";
import "./footer.css";


const Footer = () => {
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    return (
        <footer className="main-footer">
            <div className="footer-content">
                <div className="footer-section about">
                    <div className="logo">
                        <h1>B&V <span>Cosmetics</span></h1>
                    </div>

                    <p className="footer-tagline">
                        Tu destino favorito para el maquillaje y el cuidado personal.
                    </p>
                    <button className="about-btn" onClick={() => setIsAboutOpen(true)}>
                        Conócenos ✨
                    </button>
                </div>

                <div className="footer-section contact">

                    <h4>Contacto</h4>
                    <p>
                        <a href="https://wa.me/5356126873" target="_blank" rel="noopener noreferrer">
                            <span className="wa-icon">📲</span> WhatsApp Ventas
                        </a><br />
                        <small>(+53 5612 6873)</small>
                    </p>
                    <p>
                        <a href="https://wa.me/5350722776" target="_blank" rel="noopener noreferrer">
                            <span className="wa-icon">💻</span> Soporte Web
                        </a><br />
                        <small>(+53 5072 2776)</small>
                    </p>
                </div>
            </div>

            {/* Modal de Conócenos */}
            {isAboutOpen && createPortal(
                <div className="footer-modal-overlay" onClick={() => setIsAboutOpen(false)}>
                    <div className="footer-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-footer-modal" onClick={() => setIsAboutOpen(false)}>&times;</button>
                        <div className="footer-modal-body">
                            <h2>Sobre Nosotros</h2>
                            <p>
                                ¡Bienvenid@ a <strong>B&V Cosmetics</strong> 🎀!<br /><br />
                                Si te apasiona el maquillaje 💄 y te encanta disfrutar de una buena rutina de cuidado para tu piel y cabello 🧖🏻‍♀️ ¡Has llegado al lugar indicado!<br /><br />
                                En nuestra tienda online podrás encontrar variedad de productos para consentirte a ti misma 🌸 ¡Porque lucir fabulosa siempre, nunca está de más! ✨<br /><br />
                                Si lo que buscas es un detalle para regalar a alguien especial, tenemos diferentes ofertas de sets de maquillaje que incluyen una bolsa de regalo gratis 🎁<br /><br />
                                🛵 Contamos con servicio de mensajería <br /><br />
                                💵 Aceptamos pagos en efectivo y transferencia (CUP)<br /><br />
                                Para realizar sus encargos 🛍️ o preguntar dudas❓ pueden escribirnos, les atenderemos con gusto 🤗💖
                            </p>
                            <div className="footer-modal-wa">
                                <a href="https://wa.me/qr/Q2GR6RZJ3DB4I1" target="_blank" className="wa-link">WhatsApp 1</a>
                                <a href="https://wa.me/qr/KW6X635YRF27M1" target="_blank" className="wa-link">WhatsApp 2</a>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </footer>
    );
};


export default Footer;