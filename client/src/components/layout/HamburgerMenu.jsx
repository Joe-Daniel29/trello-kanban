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
                            {/* Light/Dark Mode Toggle */}
                            <div className="menu-section">
                                <div className="menu-section-title">
                                    {mode === 'light' ? <FaSun /> : <FaMoon />}
                                    <span>Appearance</span>
                                </div>

                                <div className="mode-toggle-container">
                                    <span className={`mode-label ${mode === 'light' ? 'active' : ''}`}>
                                        <FaSun /> Light
                                    </span>
                                    <button 
                                        className="mode-toggle"
                                        onClick={toggleMode}
                                        aria-label="Toggle light/dark mode"
                                    >
                                        <div className={`mode-toggle-slider ${mode === 'dark' ? 'dark' : 'light'}`}></div>
                                    </button>
                                    <span className={`mode-label ${mode === 'dark' ? 'active' : ''}`}>
                                        <FaMoon /> Dark
                                    </span>
                                </div>
                            </div>

                            {/* Color Scheme Section */}
                            <div className="menu-section">
                                <div className="menu-section-title">
                                    <FaPalette />
                                    <span>Color Scheme</span>
                                </div>

                                <div className="color-scheme-options">
                                    {Object.entries(colorSchemes).map(([key, scheme]) => (
                                        <button
                                            key={key}
                                            className={`color-scheme-button ${colorScheme === key ? 'active' : ''}`}
                                            onClick={() => changeColorScheme(key)}
                                            style={{ 
                                                backgroundColor: scheme.primary,
                                            }}
                                            aria-label={`${scheme.name} color scheme`}
                                            title={scheme.name}
                                        >
                                            {colorScheme === key && (
                                                <div className="color-scheme-check">✓</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* User Section */}
                            {user && (
                                <div className="menu-section">
                                    <div className="menu-section-title">
                                        <FaSignOutAlt />
                                        <span>Account</span>
                                    </div>

                                    <button className="logout-button" onClick={handleLogout}>
                                        <FaSignOutAlt />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HamburgerMenu;
