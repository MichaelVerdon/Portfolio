import React, { useState } from 'react';
import './App.css';

const Navbar = ({ Logo }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="nav">
            <div className="logoContainer">
                <a href="/">
                    <img src={Logo} alt="Logo" />
                </a>
            </div>
            <div className={`navContentsContainer ${isOpen ? 'open' : ''}`}>
                <ul className={`navList ${isOpen ? 'active' : ''}`}>
                    <li>
                        <a href="/projects" className="header">Projects</a>
                    </li>
                    <li>
                        <a href="/skills" className="header">Skills</a>
                    </li>
                    <li>
                        <a href="/contact" className="header">Contact</a>
                    </li>
                </ul>
            </div>
            <div className="hamburger" onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>
        </nav>
    );
};

export default Navbar;
