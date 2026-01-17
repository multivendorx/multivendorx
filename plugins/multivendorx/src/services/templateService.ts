/// <reference types="webpack-env" />

// Predefined contexts
const contexts: Record<string, __WebpackModuleApi.RequireContext> = {
	settings: require.context('../components/Settings', true, /\.ts$/),
	tools: require.context('../components/StatusAndTools', true, /\.ts$/),
	storeStatus: require.context('../components/StoreStatus', true, /\.ts$/),
	membership: require.context('../components/Membership', true, /\.ts$/),
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

	// Utility: format folder names
	const formatFolderName = (name: string): string => {
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

			let folderObject = currentFolder.find(
				(item) =>
					item.name === formattedFolderName && item.type === 'folder'
			) as SettingNode | undefined;

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
		if (fileName !== 'folderPriority.ts') {
			currentFolder.push({
				name: fileName!.replace('.ts', ''), // keep raw file name
				type: 'file',
				content: inpContext(key).default,
			});
		}
	});

	// Step 4: FIXED - Sort both files and folders by priority
	const sortStructure = (nodes: SettingNode[]): SettingNode[] => {
		const sorted = nodes
			.sort((a, b) => {
				// Get priority for any node type
				const getPriority = (node: SettingNode): number => {
					if (node.type === 'file') {
						const priority = node.content?.priority ?? Infinity;
						return priority;
					} else {
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

const getTemplateData = (
	type: 'settings' | 'tools' | 'storeStatus' | 'membership'
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



