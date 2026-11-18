import { applyFilters } from '@wordpress/hooks';
/// <reference types="webpack-env" />
// Predefined contexts
const contexts = {
    settings: require.context('../components/Settings', true, /\.ts$/),
    synchronization: require.context('../components/Synchronization', true, /\.ts$/),
};
const importAll = (inpContext) => {
    const folderStructure = [];
    // Step 1: Build folder priority map
    const folderPriorityMap = {};
    inpContext.keys().forEach((key) => {
        if (key.endsWith('FolderPriority.ts')) {
            const folderPath = key
                .replace('./', '')
                .replace('/FolderPriority.ts', '');
            const priorityData = inpContext(key)?.default;
            if (priorityData && typeof priorityData.priority === 'number') {
                folderPriorityMap[folderPath] = priorityData.priority;
            }
        }
    });
    // Utility: format folder names
    const formatFolderName = (name) => {
        return name
            .replace(/[_-]/g, ' ') // convert _ and - to space
            .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // keep acronyms together
            .replace(/\s+/g, ' ') // collapse multiple spaces
            .trim(); // clean up edges
    };
    // Step 2: Build folder/file structure
    inpContext.keys().forEach((key) => {
        const path = key.substring(2); // remove leading './'
        const parts = path.split('/');
        const fileName = parts.pop();
        let currentFolder = folderStructure;
        let fullPath = '';
        parts.forEach((folder) => {
            fullPath = fullPath ? `${fullPath}/${folder}` : folder;
            const formattedFolderName = formatFolderName(folder);
            let folderObject = currentFolder.find((item) => item.name === formattedFolderName && item.type === 'folder');
            if (!folderObject) {
                folderObject = {
                    name: formattedFolderName, // ✅ formatted name for folders
                    type: 'folder',
                    content: [],
                    folderPriority: folderPriorityMap[fullPath], // attach priority if exists
                };
                currentFolder.push(folderObject);
            }
            currentFolder = folderObject.content;
        });
        // Step 3: Skip folderPriority.ts
        if (fileName !== 'FolderPriority.ts') {
            currentFolder.push({
                name: fileName.replace('.ts', ''), // keep raw file name
                type: 'file',
                content: inpContext(key).default,
            });
        }
    });
    // Step 4: FIXED - Sort both files and folders by priority
    const sortStructure = (nodes) => {
        const sorted = nodes
            .sort((a, b) => {
            const getPriority = (node) => {
                if (node.type === 'file') {
                    const priority = node.content?.priority ?? Infinity;
                    return priority;
                }
                else {
                    const priority = node.folderPriority ?? Infinity;
                    return priority;
                }
            };
            const aPriority = getPriority(a);
            const bPriority = getPriority(b);
            // Sort purely by priority number (lowest first)
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
        return sorted;
    };
    return sortStructure(folderStructure);
};
const getTemplateData = (type) => {
    let ctx = contexts[type];
    if (!ctx) {
        console.warn(`⚠️ No context found for type: ${type}`);
        return [];
    }
    ctx = applyFilters('moowoodle_settings_context', ctx, type);
    return importAll(ctx);
};
export { getTemplateData };
//# sourceMappingURL=templateService.js.map