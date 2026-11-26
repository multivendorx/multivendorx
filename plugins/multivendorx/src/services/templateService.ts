import { applyFilters } from '@wordpress/hooks';
/// <reference types="webpack-env" />

// Predefined contexts
const contexts: Record<string, __WebpackModuleApi.RequireContext> = {
	settings: require.context('../components/Settings', true, /\.ts$/),
	storeStatus: require.context('../components/StoreStatus', true, /\.ts$/),
	dashboardSettings: require.context(
		'../dashboard/DashboardSettings',
		true,
		/\.ts$/
	),
};

type SettingNode = {
	name: string;
	type: 'folder' | 'file';
	content: SettingNode[] | any;
	folderPriority?: number;
	/** The folder's menu icon (zyra's NavigatorComponent reads `headerIcon` on a folder as on a tab). */
	headerIcon?: string;
};

/** Fields whose `desc` is not the help text under an input, so it stays where the field draws it. */
const DESC_STAYS_RIGHT = new Set(['section', 'notice', 'expandable-panel']);

type SettingField = {
	type?: string;
	label?: unknown;
	desc?: unknown;
	settingDescription?: unknown;
};

/**
 * Settings → every labelled field: the help text sits under the field's name on the left (zyra draws
 * `settingDescription` there) rather than under the input on the right, so the right column holds only the control.
 * A field that already has left-hand text keeps it first, with the old right-hand text after it.
 */
const moveDescriptionsUnderLabels = <T extends { modal?: SettingField[] }>(
	tab: T
): T => {
	if (!tab || !Array.isArray(tab.modal)) {
		return tab;
	}

	return {
		...tab,
		modal: tab.modal.map((field: SettingField) => {
			if (
				!field?.label ||
				!field.desc ||
				typeof field.desc !== 'string' ||
				DESC_STAYS_RIGHT.has(field.type ?? '')
			) {
				return field;
			}

			const { desc, ...rest } = field;

			return {
				...rest,
				settingDescription: field.settingDescription
					? `${field.settingDescription}<br/>${desc}`
					: desc,
			};
		}),
	};
};

const importAll = (
	inpContext: __WebpackModuleApi.RequireContext,
	descriptionsUnderLabels = false
): SettingNode[] => {
	const folderStructure: SettingNode[] = [];

	// Step 1: Build folder priority map
	const folderPriorityMap: Record<string, number> = {};
	// A folder's menu icon, from `headerIcon` in its FolderPriority.ts (a tab file sets its own).
	const folderIconMap: Record<string, string> = {};

	inpContext.keys().forEach((key) => {
		if (key.endsWith('FolderPriority.ts')) {
			const folderPath = key
				.replace('./', '')
				.replace('/FolderPriority.ts', '');
			const priorityData = inpContext(key)?.default;
			if (priorityData && typeof priorityData.priority === 'number') {
				folderPriorityMap[folderPath] = priorityData.priority;
			}
			if (priorityData && typeof priorityData.headerIcon === 'string') {
				folderIconMap[folderPath] = priorityData.headerIcon;
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
					headerIcon: folderIconMap[fullPath],
				};
				currentFolder.push(folderObject);
			}

			currentFolder = folderObject.content;
		});

		// Step 3: Skip folderPriority.ts
		if (fileName !== 'FolderPriority.ts') {
			currentFolder.push({
				name: fileName!.replace('.ts', ''), // keep raw file name
				type: 'file',
				content: descriptionsUnderLabels
					? moveDescriptionsUnderLabels(inpContext(key).default)
					: inpContext(key).default,
			});
		}
	});

	// Step 4: FIXED - Sort both files and folders by priority
	const sortStructure = (nodes: SettingNode[]): SettingNode[] => {
		const sorted = nodes
			.sort((a, b) => {
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
	type: 'settings' | 'storeStatus' | 'dashboardSettings'
): SettingNode[] => {
	let ctx = contexts[type];

	if (!ctx) {
		console.warn(`⚠️ No context found for type: ${type}`);
		return [];
	}

	ctx = applyFilters('multivendorx_settings_context', ctx, type);

	return importAll(ctx, 'settings' === type);
};

const getModuleData = () => {
	try {
		const module = require('../components/Modules/index.ts').default;
		return module;
	} catch (error) {
		console.warn('Module not found, skipping...', error);
		return null;
	}
};

export { getTemplateData, getModuleData };
