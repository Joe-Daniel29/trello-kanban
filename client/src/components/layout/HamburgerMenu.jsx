import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaBars, FaTimes, FaSun, FaMoon, FaPalette, FaSignOutAlt } from 'react-icons/fa';
import './HamburgerMenu.css';

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const { mode, colorScheme, colorSchemes, toggleMode, changeColorScheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <>
            <button className="hamburger-button" onClick={toggleMenu}>
                <FaBars />
            </button>

            {isOpen && (
                <div className="hamburger-overlay" onClick={closeMenu}>
                    <div className="hamburger-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="hamburger-header">
                            <h3>Settings</h3>
                            <button className="close-button" onClick={closeMenu}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="hamburger-content">
                            {/* Theme Toggle */}
                            <div className="menu-section">
                                <label className="menu-label">Theme</label>
                                <div className="theme-toggle-container">
                                    <FaSun className="theme-icon" />
                                    <button 
                                        className="theme-toggle-switch"
                                        onClick={toggleMode}
                                        aria-label="Toggle theme"
                                    >
                                        <span className={`toggle-slider ${mode}`}></span>
                                    </button>
                                    <FaMoon className="theme-icon" />
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div className="menu-section">
                                <label className="menu-label">Accent Color</label>
                                <div className="color-options">
                                    {Object.entries(colorSchemes).map(([key, scheme]) => (
                                        <button
                                            key={key}
                                            className={`color-btn ${colorScheme === key ? 'active' : ''}`}
                                            onClick={() => changeColorScheme(key)}
                                            style={{ backgroundColor: scheme.primary }}
                                            title={scheme.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Logout */}
                            {user && (
                                <button className="logout-btn" onClick={handleLogout}>
                                    <FaSignOutAlt />
                                    <span>Logout</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HamburgerMenu;
