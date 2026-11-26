import { __ } from '@wordpress/i18n';
import { getTemplateData } from './services/templateService';

/**
 * The header search's index: the MooWoodle tabs, every Settings and Synchronization tab, and the sections and
 * fields on each. Built when a search runs, not at load, so tabs MooWoodle Pro adds through
 * `moowoodle_settings_context` are included once its bundle has registered them.
 */
export type SearchItem = {
	id: string;
	/** Which option of the header's dropdown this result belongs to. */
	category: 'pages' | 'settings' | 'synchronization';
	name: string;
	desc?: string;
	/** The `#&tab=…` hash of the MooWoodle admin page that shows this result. */
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
		name: __('Dashboard', 'moowoodle'),
		desc: __('Overview, quick links and Free vs Pro.', 'moowoodle'),
		tab: 'dashboard',
		icon: 'module',
	},
	{
		id: 'help-support',
		name: __('Help & Support', 'moowoodle'),
		desc: __(
			'Documentation, videos, the forum, troubleshooting and contacting our team.',
			'moowoodle'
		),
		tab: 'dashboard&view=help-support',
		icon: 'customer-support',
	},
	{
		id: 'courses',
		name: __('Courses', 'moowoodle'),
		desc: __('Moodle courses linked to your products.', 'moowoodle'),
		tab: 'courses',
		icon: 'bulk-course-sync',
	},
	{
		id: 'cohorts',
		name: __('Cohorts', 'moowoodle'),
		desc: __('Moodle cohorts sold as products.', 'moowoodle'),
		tab: 'cohorts',
		icon: 'cohort',
	},
	{
		id: 'enrolments',
		name: __('Enrolments', 'moowoodle'),
		desc: __('Who is enrolled in which course.', 'moowoodle'),
		tab: 'enrolments',
		icon: 'classroom-enrollment',
	},
];

/** Every tab of one navigator screen (Settings or Synchronization), with the sections and fields on it. */
const indexNavigator = (type: 'settings' | 'synchronization'): SearchItem[] =>
	flattenTabs(getTemplateData(type) as SettingNode[]).flatMap((tab) => {
		const link = `&tab=${type}&subtab=${tab.id}`;

		return [
			{
				id: `${type}-${tab.id}`,
				category: type,
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
								id: `${type}-${tab.id}-${field.key}`,
								category: type,
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

/** The MooWoodle tabs, then every Settings and Synchronization tab with its fields. */
export const buildSearchIndex = (): SearchItem[] => [
	...PAGES.map((page) => ({
		id: `page-${page.id}`,
		category: 'pages' as const,
		name: page.name,
		desc: page.desc,
		link: `&tab=${page.tab}`,
		icon: page.icon,
	})),
	...indexNavigator('settings'),
	...indexNavigator('synchronization'),
];
