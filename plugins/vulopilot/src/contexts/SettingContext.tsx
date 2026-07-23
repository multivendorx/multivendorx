import React, { createContext, useReducer, useContext, ReactNode } from 'react';

/**
 * Same tiny reducer-backed context every plugin in this workspace that
 * uses zyra's InputRenderer/NavigatorComponent settings framework carries
 * its own copy of (see the free multivendorx plugin's
 * contexts/SettingContext.tsx) — it's generic, per-tab local state, not
 * something zyra itself exports, so each consuming plugin owns its own
 * instance rather than importing a shared one that doesn't exist.
 */
type SettingState = {
	settingName: string;
	setting: Record<string, unknown>;
};

type SettingAction =
	| {
			type: 'SET_SETTINGS';
			payload: { settingName: string; setting: Record<string, unknown> };
	  }
	| { type: 'UPDATE_SETTINGS'; payload: { key: string; value: unknown } }
	| { type: 'CLEAR_SETTINGS' };

/* eslint-disable no-unused-vars -- named params in a type signature aren't runtime bindings; the base no-unused-vars rule doesn't parse TS type positions and misflags them. */
type SettingContextType = SettingState & {
	setSetting: (name: string, setting: Record<string, unknown>) => void;
	updateSetting: (key: string, value: unknown) => void;
	clearSetting: () => void;
};
/* eslint-enable no-unused-vars */

const initialState: SettingState = {
	settingName: '',
	setting: {},
};

const SettingContext = createContext<SettingContextType | undefined>(undefined);

const settingReducer = (
	state: SettingState,
	action: SettingAction
): SettingState => {
	switch (action.type) {
		case 'SET_SETTINGS': {
			return { ...action.payload };
		}
		case 'UPDATE_SETTINGS': {
			const { key, value } = action.payload;
			const setting = { ...state.setting, [key]: value };
			return { ...state, setting };
		}
		case 'CLEAR_SETTINGS': {
			return { settingName: '', setting: {} };
		}
		default:
			return state;
	}
};

type SettingProviderProps = {
	children: ReactNode;
};

const SettingProvider: React.FC<SettingProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(settingReducer, initialState);

	const setSetting = (
		settingName: string,
		setting: Record<string, unknown>
	) => {
		dispatch({ type: 'SET_SETTINGS', payload: { settingName, setting } });
	};

	const updateSetting = (key: string, value: unknown) => {
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

const useSetting = (): SettingContextType => {
	const context = useContext(SettingContext);
	if (!context) {
		throw new Error('useSetting must be used within a SettingProvider');
	}
	return context;
};

export { SettingProvider, useSetting };
