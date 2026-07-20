import React, { createContext, useReducer, useContext, ReactNode } from 'react';

type SettingValue =
    | string
    | number
    | boolean
    | null
    | Record<string, string | number | boolean | null>;

// Define types for the state
type SettingState = {
    settingName: string;
    setting: Record<string, SettingValue>;
};

// Define types for actions
type SettingAction =
    | {
          type: 'SET_SETTINGS';
          payload: {
              settingName: string;
              setting: Record<string, SettingValue>;
          };
      }
    | { type: 'UPDATE_SETTINGS'; payload: { key: string; value: SettingValue } }
    | { type: 'CLEAR_SETTINGS' };

// Define context type
export type SettingContextType = SettingState & {
    setSetting: (name: string, setting: Record<string, SettingValue>) => void;
    updateSetting: (key: string, value: SettingValue) => void;
    clearSetting: () => void;
};

// Initial state
const initialState: SettingState = {
    settingName: '',
    setting: {},
};

// Create context
const SettingContext = createContext<SettingContextType | undefined>(undefined);

// Reducer function
const settingReducer = (
    state: SettingState,
    action: SettingAction
): SettingState => {
    switch (action.type) {
        case 'SET_SETTINGS':
            return { ...action.payload };

        case 'UPDATE_SETTINGS': {
            const { key, value } = action.payload;
            const setting = { ...state.setting, [key]: value };
            return { ...state, setting };
        }

        case 'CLEAR_SETTINGS':
            return { settingName: '', setting: {} };

        default:
            return state;
    }
};

// Provider props type
type SettingProviderProps = {
    children: ReactNode;
};

// Context provider component
const SettingProvider: React.FC<SettingProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(settingReducer, initialState);

    const setSetting = (
        settingName: string,
        setting: Record<string, SettingValue>
    ) => {
        dispatch({ type: 'SET_SETTINGS', payload: { settingName, setting } });
    };

    const updateSetting = (key: string, value: SettingValue) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { key, value } });
    };

    const clearSetting = () => {
        dispatch({ type: 'CLEAR_SETTINGS' });
    };

    return (
        <SettingContext.Provider
            value={{
                ...state,
                setSetting,
                updateSetting,
                clearSetting,
            }}
        >
            {children}
        </SettingContext.Provider>
    );
};

// Custom hook to access the context
const useSetting = (): SettingContextType => {
    const context = useContext(SettingContext);
    if (!context) {
        throw new Error('useSetting must be used within a SettingProvider');
    }
    return context;
};

export { SettingProvider, useSetting };
