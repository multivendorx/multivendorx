import React, { createContext, useReducer, useContext } from 'react';

type Theme = 'light' | 'dark';

type ThemeState = {
    theme: Theme;
};

type ThemeAction = {
    type: 'TOGGLE_THEME';
};

type ThemeContextValue = ThemeState & {
    toggleTheme: () => void;
};

// theme context object.
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * dispatch function for theme related operation.
 * @param {*} state  state variable
 * @param {*} action name of action for state variable.
 * @returns
 */
const themeReducer = (state: ThemeState, action: ThemeAction) => {
    switch (action.type) {
        case 'TOGGLE_THEME':
            return {
                ...state,
                theme: state.theme === 'light' ? 'dark' : 'light',
            } as ThemeState;
        default:
            return state;
    }
};

/**
 * context provider component
 * @param {*} props
 * @returns
 */

const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, dispatch] = useReducer(themeReducer, { theme: 'light' });

    /**
     * toggle the theme if dark then toogle to light. vice versa.
     */
    const toggleTheme = () => {
        dispatch({ type: 'TOGGLE_THEME' });
    };

    return (
        <ThemeContext.Provider value={{ ...state, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * get theme context.
 * @returns [ state, toggleTheme ]
 */
const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export { ThemeProvider, useTheme };
