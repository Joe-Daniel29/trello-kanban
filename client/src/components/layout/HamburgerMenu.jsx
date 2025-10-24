import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaBars, FaTimes, FaSun, FaMoon, FaPalette, FaSignOutAlt } from 'react-icons/fa';
import './HamburgerMenu.css';

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const { currentTheme, changeTheme, themes } = useTheme();
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
                            {/* Theme Section */}
                            <div className="menu-section">
                                <div className="menu-section-title">
                                    <FaPalette />
                                    <span>Theme</span>
                                </div>

                                <div className="theme-options">
                                    {Object.entries(themes).map(([key, theme]) => (
                                        <button
                                            key={key}
                                            className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                                            onClick={() => {
                                                changeTheme(key);
                                                closeMenu();
                                            }}
                                        >
                                            <div className={`theme-preview theme-${key}`}>
                                                <div className="theme-preview-primary"></div>
                                                <div className="theme-preview-secondary"></div>
                                            </div>
                                            <span className="theme-name">{theme.name}</span>
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
