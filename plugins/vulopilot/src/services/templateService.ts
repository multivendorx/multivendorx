import { applyFilters } from '@wordpress/hooks';

/**
 * Same `require.context`-based settings-tab discovery the free
 * multivendorx plugin's own templateService.ts uses (react-frontend.md's
 * "declarative settings-config pattern") — one context here
 * (`settings`), since VuloPilot only has one settings screen today, vs.
 * multivendorx's several (settings/tools/storeStatus/dashboardSettings).
 * `vulopilot_settings_context` is this plugin's own filter name (not
 * multivendorx's `multivendorx_settings_context`) so a future
 * vulopilot-pro settings tab registers into a filter that's actually
 * scoped to this plugin family, following the same
 * discovery-by-filter extension pattern every other engine in this
 * codebase uses.
 */
const contexts: Record<string, any> = {
	settings: require.context('../components/Settings', true, /\.ts$/),
};

type SettingNode = {
	name: string;
	type: 'folder' | 'file';
	content: SettingNode[] | any;
	folderPriority?: number;
};

const importAll = (
	inpContext: any
): SettingNode[] => {
	const folderStructure: SettingNode[] = [];
	const folderPriorityMap: Record<string, number> = {};

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

	const formatFolderName = (name: string): string => {
		return name
			.replace(/[_-]/g, ' ')
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
			.replace(/\s+/g, ' ')
			.trim();
	};

	inpContext.keys().forEach((key) => {
		const path = key.substring(2);
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
					name: formattedFolderName,
					type: 'folder',
					content: [],
					folderPriority: folderPriorityMap[fullPath],
				};
				currentFolder.push(folderObject);
			}

			currentFolder = folderObject.content;
		});

		if (fileName !== 'FolderPriority.ts') {
			currentFolder.push({
				name: fileName!.replace('.ts', ''),
				type: 'file',
				content: inpContext(key).default,
			});
		}
	});

	const sortStructure = (nodes: SettingNode[]): SettingNode[] => {
		return nodes
			.sort((a, b) => {
				const getPriority = (node: SettingNode): number => {
					if (node.type === 'file') {
						return node.content?.priority ?? Infinity;
					}
					return node.folderPriority ?? Infinity;
				};

				return getPriority(a) - getPriority(b);
			})
			.map((node) => {
				if (node.type === 'folder') {
					return { ...node, content: sortStructure(node.content) };
				}
				return node;
			});
	};

	return sortStructure(folderStructure);
};

const getTemplateData = (type: 'settings'): SettingNode[] => {
	let ctx = contexts[type];

	if (!ctx) {
		 
		console.warn(`No context found for type: ${type}`);
		return [];
	}

	ctx = applyFilters('vulopilot_settings_context', ctx, type) as typeof ctx;

	return importAll(ctx);
};

/**
 * The Modules page's metadata catalog — mirrors the free multivendorx
 * plugin's own `getModuleData()` exactly (a plain `require()`, not a
 * `require.context`, since there's exactly one file to load, not a
 * folder of them). Returns null (not an empty catalog) if the file is
 * ever missing, so `Modules.tsx` can render its own "nothing here yet"
 * state honestly rather than crashing.
 */
const getModuleData = () => {
	try {
		const moduleData = require('../components/Modules/index.ts').default;
		return moduleData;
	} catch (error) {
		console.warn('Module data not found, skipping...', error);
		return null;
	}
};

export { getTemplateData, getModuleData };
export default getTemplateData;
