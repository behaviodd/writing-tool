import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type AccentColor = 'blue' | 'purple' | 'green' | 'red' | 'orange';

interface ThemeContextType {
    theme: Theme;
    accentColor: AccentColor;
    setTheme: (theme: Theme) => void;
    setAccentColor: (color: AccentColor) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme as Theme) || 'light';
    });

    const [accentColor, setAccentColor] = useState<AccentColor>(() => {
        const savedColor = localStorage.getItem('accentColor');
        return (savedColor as AccentColor) || 'blue';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('accentColor', accentColor);
        document.documentElement.setAttribute('data-accent-color', accentColor);
    }, [accentColor]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
