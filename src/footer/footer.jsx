import React from "react";
import "./footer.css";

class Footer extends React.Component {
    render() {
        return (
            <footer className="main-footer">
                <div className="footer-content">
                    <div className="footer-section about">
                        <h3>B&V Cosméticos</h3>
                        <p>Productos de maquillaje</p>
                    </div>
                    <div className="footer-section links">
                        <h4>Navegación</h4>
                        <ul>
                            <li><a href="#inicio">Inicio</a></li>
                            <li><a href="#catalogo">Catálogo</a></li>
                            <li><a href="#contacto">Contacto</a></li>
                        </ul>
                    </div>

                    <div className="footer-section contact">
                        <h4>Contacto</h4>
                        <p>
                            <a href="https://wa.me/5356126873" target="_blank" rel="noopener noreferrer">WhatsApp Ventas</a> (+5356126873)
                        </p>
                        <p>
                            <a href="https://wa.me/5350722776" target="_blank" rel="noopener noreferrer">WhatsApp Creación de páginas web</a> (+5350722776)
                        </p>
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;