import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Color scheme configurations
const colorSchemes = {
    purple: {
        name: 'Purple',
        primary: '#7c3aed',
        primaryHover: '#6d28d9',
    },
    blue: {
        name: 'Blue',
        primary: '#3b82f6',
        primaryHover: '#2563eb',
    },
    green: {
        name: 'Green',
        primary: '#10b981',
        primaryHover: '#059669',
    },
    red: {
        name: 'Red',
        primary: '#ef4444',
        primaryHover: '#dc2626',
    },
    orange: {
        name: 'Orange',
        primary: '#f59e0b',
        primaryHover: '#d97706',
    },
    pink: {
        name: 'Pink',
        primary: '#ec4899',
        primaryHover: '#db2777',
    }
};

// Light and dark mode configurations
const modeConfigs = {
    light: {
        background: '#ffffff',
        surface: '#f8fafc',
        surfaceHover: '#e2e8f0',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
    },
    dark: {
        background: '#1a1a1a',
        surface: '#2a2d35',
        surfaceHover: '#3a3e4a',
        text: '#e0e0e0',
        textSecondary: '#6b7280',
        border: '#3a3e4a',
    }
};

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('dark'); // 'light' or 'dark'
    const [colorScheme, setColorScheme] = useState('purple');

    // Load theme settings from cookies on mount
    useEffect(() => {
        const savedMode = getCookie('themeMode');
        const savedColorScheme = getCookie('colorScheme');
        
        if (savedMode && modeConfigs[savedMode]) {
            setMode(savedMode);
        }
        if (savedColorScheme && colorSchemes[savedColorScheme]) {
            setColorScheme(savedColorScheme);
        }
    }, []);

    // Apply theme to document root
    useEffect(() => {
        const modeConfig = modeConfigs[mode];
        const colorConfig = colorSchemes[colorScheme];
        const root = document.documentElement;

        // Apply mode-specific colors
        Object.entries(modeConfig).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        // Apply color scheme
        root.style.setProperty('--color-primary', colorConfig.primary);
        root.style.setProperty('--color-primaryHover', colorConfig.primaryHover);

        // Apply common colors
        root.style.setProperty('--color-success', '#10b981');
        root.style.setProperty('--color-warning', '#f59e0b');
        root.style.setProperty('--color-error', '#ef4444');
        root.style.setProperty('--color-white', '#ffffff');

        root.setAttribute('data-theme', mode);
        root.setAttribute('data-color-scheme', colorScheme);
    }, [mode, colorScheme]);

    const toggleMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        setCookie('themeMode', newMode, 365);
    };

    const changeColorScheme = (scheme) => {
        if (colorSchemes[scheme]) {
            setColorScheme(scheme);
            setCookie('colorScheme', scheme, 365);
        }
    };

    const value = {
        mode,
        colorScheme,
        colorSchemes,
        toggleMode,
        changeColorScheme,
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
