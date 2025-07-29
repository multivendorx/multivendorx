/// <reference types="webpack-env" />

import Membership from "@/components/Membership/Membership";


// Predefined contexts
const contexts: Record<string, __WebpackModuleApi.RequireContext> = {
    settings: require.context('../components/Settings', true, /\.ts$/),
    stores: require.context(
        '../components/Store',
        true,
        /\.ts$/
    ),
    memberships: require.context(
        '../components/Membership',
        true,
        /\.ts$/
    ),
};

type SettingNode = {
    name: string;
    type: 'folder' | 'file';
    content: SettingNode[] | any;
};

const importAll = (
    inpContext: __WebpackModuleApi.RequireContext
): SettingNode[] => {
    const folderStructure: SettingNode[] = [];

    inpContext.keys().forEach((key) => {
        const path = key.substring(2);
        const parts = path.split('/');
        const fileName = parts.pop();
        let currentFolder = folderStructure;

        parts.forEach((folder) => {
            let folderObject = currentFolder.find(
                (item) => item.name === folder && item.type === 'folder'
            ) as SettingNode | undefined;

            if (!folderObject) {
                folderObject = { name: folder, type: 'folder', content: [] };
                currentFolder.push(folderObject);
            }

            currentFolder = folderObject.content;
        });

        currentFolder.push({
            name: fileName!.replace('.js', ''),
            type: 'file',
            content: inpContext(key).default,
        });
    });

    return folderStructure;
};

const getTemplateData = (
    type: 'settings' | 'stores' | 'memberships'
): SettingNode[] => {
    const ctx = contexts[type];

    if (!ctx) {
        console.warn(`⚠️ No context found for type: ${type}`);
        return [];
    }

    return importAll(ctx);
};

const getModuleData = (): any | null => {
    try {
        const module = require('../components/Modules/index.ts').default;
        return module;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Module not found, skipping...');
        return null;
    }
};

export { getTemplateData, getModuleData };
