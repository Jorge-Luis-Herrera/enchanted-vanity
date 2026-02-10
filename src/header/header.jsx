import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./header.css";

const Header = ({ onSearch }) => {
    const [scrolled, setScrolled] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearch) onSearch(value);
    };

    return (
        <header className={`main-header ${scrolled ? "scrolled" : ""}`}>
            <div className="logo">
                <h1>Enchanted <span>Vanity</span></h1>
            </div>
            <div className="search-bar">
                <input 
                    type="text" 
                    placeholder="Buscar productos..." 
                    value={searchTerm}
                    onChange={handleChange}
                />
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