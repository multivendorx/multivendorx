import { __ } from '@wordpress/i18n';
import { getTemplateData } from './services/templateService';

/**
 * The header search's index: the Notifima tabs, every Settings tab, and the sections and fields on each. Built when a
 * search runs, not at load, so it always reflects the settings files the bundle contains.
 */
export type SearchItem = {
	id: string;
	/** Which option of the header's dropdown this result belongs to. */
	category: 'pages' | 'settings';
	name: string;
	desc?: string;
	/** The `#&tab=…` hash of the Notifima admin page that shows this result. */
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
		name: __('Dashboard', 'notifima'),
		desc: __(
			'Subscriptions, demand for out-of-stock products and what needs a look.',
			'notifima'
		),
		tab: 'dashboard',
		icon: 'module',
	},
	{
		id: 'help-support',
		name: __('Help & Support', 'notifima'),
		desc: __(
			'Documentation, troubleshooting and contacting our team.',
			'notifima'
		),
		tab: 'dashboard&view=help-support',
		icon: 'customer-support',
	},
	{
		id: 'free-vs-pro',
		name: __('Free vs Pro', 'notifima'),
		desc: __('What Notifima Pro adds, feature by feature.', 'notifima'),
		tab: 'dashboard&view=free-vs-pro',
		icon: 'pros-and-cons',
	},
	{
		id: 'subscribers-list',
		name: __('Subscribers', 'notifima'),
		desc: __(
			'Who is waiting for which product, and whether they were notified.',
			'notifima'
		),
		tab: 'subscribers-list',
		icon: 'subscriber',
	},
	{
		id: 'inventory-manager',
		name: __('Manage Stock', 'notifima'),
		desc: __(
			'Stock, prices and backorders for every product in one table.',
			'notifima'
		),
		tab: 'inventory-manager',
		icon: 'store-analytics',
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

/** The Notifima tabs, then every Settings tab with its fields. */
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
];
