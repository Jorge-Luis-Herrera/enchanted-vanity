import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./header.css";

const Header = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`main-header ${scrolled ? "scrolled" : ""}`}>
            <div className="logo">
                <h1>Enchanted <span>Vanity</span></h1>
            </div>
            <nav className="nav-menu">
                <ul>
                    <li><a href="#home">Inicio</a></li>
                    <li><a href="#catalogo">Catálogo</a></li>
                </ul>
            </nav>
            <div className="actions">
                <Link to="/login" className="contact-btn">Admin</Link>
            </div>
        </header>  
    );
};

export default Header;