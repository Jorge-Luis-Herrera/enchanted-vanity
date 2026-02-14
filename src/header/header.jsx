import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./header.css";
import LupaIcon from "../assets/Lupa.jpg";


const Header = ({ onSearch }) => {
    const [scrolled, setScrolled] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFocused,setIsFocused] = useState(false);
    const inputRef = useRef(null);

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

    const handleIconClick = () => {
        setIsFocused(true);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <header className={`main-header ${scrolled ? "scrolled" : ""} ${isFocused ? "is-searching" : ""}`}>
            <div className="logo">
                <h1>B&V <span>Cosmetics</span></h1>
            </div>
            <div className={`search-bar ${isFocused ? "focused" : ""}`}>
                <input 
                    ref={inputRef}
                    type="text" 
                    placeholder="Buscar productos..." 
                    value={searchTerm}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <div className="search-icon-container" onClick={handleIconClick}>
                    <img src={LupaIcon} alt="Buscar" />
                </div>
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