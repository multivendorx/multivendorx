import React, { createContext, useReducer, useContext, ReactNode } from "react";

// Define action types
type ModuleAction =
    | { type: "INSERT_MODULE"; payload: string }
    | { type: "DELETE_MODULE"; payload: string };

// Define state type
type ModuleState = string[];

// Define context type
type ModuleContextType = {
    modules: ModuleState;
    insertModule: ( moduleName: string ) => void;
    removeModule: ( moduleName: string ) => void;
};

// Props type for the provider
type ModuleProviderProps = {
    children: ReactNode;
    modules: ModuleState;
};

// Create context
const ModuleContext = createContext< ModuleContextType | undefined >(
    undefined
);

// Reducer function
const ModuleReducer = (
    state: ModuleState,
    action: ModuleAction
): ModuleState => {
    switch ( action.type ) {
        case "INSERT_MODULE":
            return [ ...state, action.payload ];
        case "DELETE_MODULE":
            return state.filter( ( module ) => module !== action.payload );
        default:
            return state;
    }
};

// Context provider component
const ModuleProvider: React.FC< ModuleProviderProps > = ( {
    children,
    modules,
} ) => {
    const [ state, dispatch ] = useReducer( ModuleReducer, modules );

    const insertModule = ( moduleName: string ) => {
        dispatch( { type: "INSERT_MODULE", payload: moduleName } );
    };

    const removeModule = ( moduleName: string ) => {
        dispatch( { type: "DELETE_MODULE", payload: moduleName } );
    };

    return (
        <ModuleContext.Provider
            value={ { modules: state, insertModule, removeModule } }
        >
            { children }
        </ModuleContext.Provider>
    );
};

// Custom hook to access the module context
const useModules = (): ModuleContextType => {
    const context = useContext( ModuleContext );
    if ( ! context ) {
        throw new Error( "useModules must be used within a ModuleProvider" );
    }
    return context;
};

export { ModuleProvider, useModules };
