import React from "react";
import "./footer.css";

class Footer extends React.Component {
    render() {
        return (
            <footer className="main-footer">
                <div className="footer-content">
                    <div className="footer-section about">
                        <h3>Enchanted Vanity</h3>
                        <p>Productos de maquillaje</p>
                    </div>
                    <div className="footer-section links">
                        <h4>Navegation</h4>
                        <ul>
                            <li><a href="#inicio">Inicio</a></li>
                            <li><a href="#catalogo">Catalogo</a></li>
                            <li><a href="#contacto">Contacto</a></li>
                        </ul>
                    </div>

                    <div className="footer-section contact">
                        <h4>Contacto</h4>
                        <p>Ciudad candela candelita</p>
                        <p>Gmail ...etc</p>
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;