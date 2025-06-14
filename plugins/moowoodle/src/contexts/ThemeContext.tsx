import React, { createContext, useReducer, useContext, ReactNode } from "react";

// Define types for our context
type Theme = "light" | "dark";

type ThemeState = {
    theme: Theme;
};

type ThemeAction = {
    type: "TOGGLE_THEME";
};

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

// theme context object with initial value typed
const ThemeContext = createContext< ThemeContextType | undefined >( undefined );

/**
 * dispatch function for theme related operation.
 *
 * @param state state variable
 * @param action name of action for state variable.
 * @return updated state
 */
const themeReducer = ( state: ThemeState, action: ThemeAction ): ThemeState => {
    switch ( action.type ) {
        case "TOGGLE_THEME":
            return {
                ...state,
                theme: state.theme === "light" ? "dark" : "light",
            };
        default:
            return state;
    }
};

/**
 * @param ReactNode state variable
 * context provider component
 */
const ThemeProvider: React.FC< { children: ReactNode } > = ( { children } ) => {
    const [ state, dispatch ] = useReducer( themeReducer, { theme: "light" } );

    /**
     * toggle the theme if dark then toggle to light. vice versa.
     */
    const toggleTheme = () => {
        dispatch( { type: "TOGGLE_THEME" } );
    };

    const value: ThemeContextType = {
        theme: state.theme,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={ value }>
            { children }
        </ThemeContext.Provider>
    );
};

/**
 * get theme context.
 * @return { theme, toggleTheme }
 */
const useTheme = (): ThemeContextType => {
    const context = useContext( ThemeContext );
    if ( ! context ) {
        throw new Error( "useTheme must be used within a ThemeProvider" );
    }
    return context;
};

export { ThemeProvider, useTheme };
