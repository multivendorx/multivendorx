import { __ } from '@wordpress/i18n';
import { getModuleData, getTemplateData } from './services/templateService';

/**
 * The header search's index: the CatalogX pages, every Settings tab with the sections and fields on it, and every
 * module. Built when a search runs, not at load, so tabs CatalogX Pro adds are included once its bundle has registered
 * them.
 */
export type SearchItem = {
	id: string;
	/** Which option of the header's dropdown this result belongs to. */
	category: 'pages' | 'settings' | 'modules';
	name: string;
	desc?: string;
	/** The `#&tab=…` hash of the CatalogX admin page that shows this result. */
	link: string;
	icon?: string;
};

/** Returns a value if it is a string, otherwise an empty string. */
const text = (value: unknown): string =>
	'string' === typeof value ? value : '';

/** Drops the HTML some descriptions carry (links, line breaks, highlights), so they read as plain text in results. */
const plain = (value: unknown): string =>
	text(value)
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

interface SettingField {
	key: string;
	type?: string;
	label?: unknown;
	title?: unknown;
	desc?: unknown;
	settingDescription?: unknown;
}

interface SettingTab {
	id: string;
	headerTitle: string;
	headerDescription?: string;
	headerIcon?: string;
	modal?: SettingField[];
}

interface SettingNode {
	type: 'folder' | 'file';
	content: unknown;
}

interface ModuleItem {
	id?: string;
	name?: unknown;
	desc?: unknown;
	icon?: string;
}

/** Flattens nested settings folders into a single list of tabs. */
const flattenTabs = (nodes: SettingNode[]): SettingTab[] =>
	nodes.flatMap((node) =>
		'folder' === node.type
			? flattenTabs(node.content as SettingNode[])
			: [node.content as SettingTab]
	);

const PAGES: {
	id: string;
	name: string;
	desc: string;
	tab: string;
	icon: string;
}[] = [
	{
		id: 'dashboard',
		name: __('Dashboard', 'catalogx'),
		desc: __(
			'Enquiries and quotes at a glance, setup, help and Free vs Pro.',
			'catalogx'
		),
		tab: 'dashboard',
		icon: 'module',
	},
	{
		id: 'help-support',
		name: __('Help & Support', 'catalogx'),
		desc: __(
			'Documentation, the community, troubleshooting and contacting our team.',
			'catalogx'
		),
		tab: 'dashboard&view=help-support',
		icon: 'customer-support',
	},
	{
		id: 'enquiry-messages',
		name: __('Enquiry Messages', 'catalogx'),
		desc: __('Conversations with customers about products.', 'catalogx'),
		tab: 'enquiry-messages',
		icon: 'enquiry',
	},
	{
		id: 'quote-requests',
		name: __('Quotation Requests', 'catalogx'),
		desc: __('Quotes customers asked for, and their status.', 'catalogx'),
		tab: 'quote-requests',
		icon: 'quote',
	},
	{
		id: 'wholesale-users',
		name: __('Wholesale Users', 'catalogx'),
		desc: __('Wholesale applications and approved buyers.', 'catalogx'),
		tab: 'wholesale-users',
		icon: 'wholesale',
	},
	{
		id: 'rules',
		name: __('Dynamic Pricing Rules', 'catalogx'),
		desc: __(
			'Prices by role, customer, product, category or quantity.',
			'catalogx'
		),
		tab: 'rules',
		icon: 'rules',
	},
];

/** Every Settings tab, with the sections and fields on it. */
const indexSettings = (): SearchItem[] =>
	flattenTabs(getTemplateData('settings') as SettingNode[]).flatMap((tab) => {
		const link = `&tab=settings&subtab=${tab.id}`;

		return [
			{
				id: `settings-${tab.id}`,
				category: 'settings' as const,
				name: tab.headerTitle,
				desc: plain(tab.headerDescription),
				link,
				icon: tab.headerIcon,
			},
			...(tab.modal ?? []).flatMap((field) => {
				const name = text(field.label) || text(field.title);

				return name
					? [
							{
								id: `settings-${tab.id}-${field.key}`,
								category: 'settings' as const,
								name,
								desc:
									plain(field.settingDescription) ||
									plain(field.desc),
								link,
								icon: tab.headerIcon,
							},
						]
					: [];
			}),
		];
	});

/** Every module, linked to its card on Settings → Modules. */
const indexModules = (): SearchItem[] => {
	const modules = (getModuleData()?.modules ?? []) as ModuleItem[];

	return modules.flatMap((module) =>
		module.id && text(module.name)
			? [
					{
						id: `module-${module.id}`,
						category: 'modules' as const,
						name: text(module.name),
						desc: plain(module.desc),
						link: `&tab=settings&subtab=modules&module=${module.id}`,
						icon: module.icon,
					},
				]
			: []
	);
};

/** The CatalogX pages, then every Settings tab with its fields, then every module. */
export const buildSearchIndex = (): SearchItem[] => [
	...PAGES.map((page) => ({
		id: `page-${page.id}`,
		category: 'pages' as const,
		name: page.name,
		desc: page.desc,
		link: `&tab=${page.tab}`,
		icon: page.icon,
	})),
	...indexSettings(),
	...indexModules(),
];
