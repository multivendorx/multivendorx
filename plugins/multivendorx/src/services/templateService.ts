/// <reference types="webpack-env" />

// Predefined contexts
const contexts: Record<string, __WebpackModuleApi.RequireContext> = {
    settings: require.context('../components/Settings', true, /\.ts$/),
    tools: require.context('../components/StatusAndTools', true, /\.ts$/),
};

type SettingNode = {
    name: string;
    type: 'folder' | 'file';
    content: SettingNode[] | any;
    folderPriority?: number;
};

const importAll = (
    inpContext: __WebpackModuleApi.RequireContext
): SettingNode[] => {
    const folderStructure: SettingNode[] = [];

    // Step 1: Build folder priority map
    const folderPriorityMap: Record<string, number> = {};

    inpContext.keys().forEach((key) => {
        if (key.endsWith('folderPriority.ts')) {
            const folderPath = key
                .replace('./', '')
                .replace('/folderPriority.ts', '');
            const priorityData = inpContext(key)?.default;
            if (priorityData && typeof priorityData.priority === 'number') {
                folderPriorityMap[folderPath] = priorityData.priority;
            }
        }
    });

    // Step 2: Build folder/file structure
    inpContext.keys().forEach((key) => {
        const path = key.substring(2); // remove leading './'
        const parts = path.split('/');
        const fileName = parts.pop();
        let currentFolder = folderStructure;
        let fullPath = '';

        parts.forEach((folder) => {
            fullPath = fullPath ? `${fullPath}/${folder}` : folder;

            let folderObject = currentFolder.find(
                (item) => item.name === folder && item.type === 'folder'
            ) as SettingNode | undefined;

            if (!folderObject) {
                folderObject = {
                    name: folder,
                    type: 'folder',
                    content: [],
                    folderPriority: folderPriorityMap[fullPath], // attach priority if exists
                };
                currentFolder.push(folderObject);
            }

            currentFolder = folderObject.content;
        });

        // Step 3: Skip folder-priority.ts
        if (fileName !== 'folder-priority.ts') {
            currentFolder.push({
                name: fileName!.replace('.ts', ''),
                type: 'file',
                content: inpContext(key).default,
            });
        }
    });

    // Step 4: Sort recursively: files first, then folders by folderPriority
    const sortStructure = (nodes: SettingNode[]): SettingNode[] => {
        return nodes
            .sort((a, b) => {
                if (a.type === 'file' && b.type === 'folder') return -1;
                if (a.type === 'folder' && b.type === 'file') return 1;

                const aPriority = a.folderPriority ?? Infinity;
                const bPriority = b.folderPriority ?? Infinity;

                return aPriority - bPriority;
            })
            .map((node) => {
                if (node.type === 'folder') {
                    return {
                        ...node,
                        content: sortStructure(node.content),
                    };
                }
                return node;
            });
    };

    return sortStructure(folderStructure);
};

const getTemplateData = (
    type: 'settings' | 'tools'
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
        console.warn('Module not found, skipping...');
        return null;
    }
};

export { getTemplateData, getModuleData };
