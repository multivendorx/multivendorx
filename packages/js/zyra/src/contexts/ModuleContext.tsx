import { create } from 'zustand';
import axios from 'axios';
import { getApiLink } from '../utils/apiService';
import { ZyraVariable } from '../components/fieldUtils';

// Zustand store
type ModuleContextType = {
    modules: string[];
    insertModule: (moduleName: string) => void;
    removeModule: (moduleName: string) => void;
};

export const useModules = create<ModuleContextType>((set) => ({
    modules: [],
    insertModule: (moduleName: string) =>
        set((state) => ({
            modules: [...state.modules, moduleName],
        })),
    removeModule: (moduleName: string) =>
        set((state) => ({
            modules: state.modules.filter((m) => m !== moduleName),
        })),
}));

export async function initializeModules(
    pluginName: string,
    pluginSlug: string,
    apiLink: string
): Promise<void> {
    if (localStorage.getItem(`force_${pluginName}_context_reload`) === 'true') {
        try {
            const response = await axios.get(
                getApiLink(ZyraVariable, apiLink),
                {
                    headers: { 'X-WP-Nonce': ZyraVariable.nonce },
                }
            );

            if (Array.isArray(response.data)) {
                useModules.setState({ modules: response.data });
            }
        } catch (error) {
            console.error('Failed to fetch active modules:', error);
        }

        if (pluginSlug === 'pro') {
            localStorage.setItem(`force_${pluginName}_context_reload`, 'false');
        }
    }
}
