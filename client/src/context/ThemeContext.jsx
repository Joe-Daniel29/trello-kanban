import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Theme configurations
const themes = {
    dark: {
        name: 'Dark',
        colors: {
            primary: '#7c3aed',
            primaryHover: '#6d28d9',
            background: '#1a1a1a',
            surface: '#2a2d35',
            surfaceHover: '#3a3e4a',
            text: '#e0e0e0',
            textSecondary: '#6b7280',
            border: '#3a3e4a',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            white: '#ffffff'
        }
    },
    light: {
        name: 'Light',
        colors: {
            primary: '#7c3aed',
            primaryHover: '#6d28d9',
            background: '#ffffff',
            surface: '#f8fafc',
            surfaceHover: '#e2e8f0',
            text: '#1e293b',
            textSecondary: '#64748b',
            border: '#e2e8f0',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            white: '#ffffff'
        }
    },
    blue: {
        name: 'Blue',
        colors: {
            primary: '#3b82f6',
            primaryHover: '#2563eb',
            background: '#0f172a',
            surface: '#1e293b',
            surfaceHover: '#334155',
            text: '#e2e8f0',
            textSecondary: '#94a3b8',
            border: '#334155',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            white: '#ffffff'
        }
    },
    yellow: {
        name: 'Yellow',
        colors: {
            primary: '#f59e0b',
            primaryHover: '#d97706',
            background: '#1f2937',
            surface: '#374151',
            surfaceHover: '#4b5563',
            text: '#f9fafb',
            textSecondary: '#9ca3af',
            border: '#4b5563',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            white: '#ffffff'
        }
    }
};

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState('dark');

    // Load theme from cookies on mount
    useEffect(() => {
        const savedTheme = getCookie('theme');
        if (savedTheme && themes[savedTheme]) {
            setCurrentTheme(savedTheme);
        }
    }, []);

    // Apply theme to document root
    useEffect(() => {
        const theme = themes[currentTheme];
        const root = document.documentElement;

        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        root.setAttribute('data-theme', currentTheme);
    }, [currentTheme]);

    const changeTheme = (themeName) => {
        if (themes[themeName]) {
            setCurrentTheme(themeName);
            setCookie('theme', themeName, 365); // Save for 1 year
        }
    };

    const value = {
        currentTheme,
        themes,
        changeTheme,
        theme: themes[currentTheme]
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Cookie utility functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
