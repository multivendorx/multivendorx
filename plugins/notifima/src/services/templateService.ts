/// <reference types="webpack-env" />

const context = require.context('../components/Settings', true, /\.ts$/);

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
            content: context(key).default,
        });
    });

    return folderStructure;
};

const getTemplateData = (): SettingNode[] => {
    return importAll(context);
};

const getModuleData = (): any | null => {
    try {
        const module = require('../components/Modules/index.ts').default;
        return module;
    } catch (_error) {
        return null;
    }
};

export { getTemplateData, getModuleData };
