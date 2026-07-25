/**
 * Header search index — same `require.context`-over-declarative-configs
 * approach the free multivendorx plugin's own searchIndex.ts uses
 * (react-frontend.md's schema-driven settings pattern already means every
 * Settings tab and Modules catalog entry is a plain object, so building a
 * search index is just walking those objects rather than maintaining a
 * separate, hand-written list). Covers both sources multivendorx's index
 * does: Settings tabs (components/Settings/**) and the Modules catalog
 * (components/Modules/index.ts).
 */
const contextSettings = require.context(
	'./components/Settings',
	true,
	/\.(ts|tsx)$/
);
const contextModules = require.context('./components/Modules', true, /\.ts$/);

export type SearchItem = {
	id: string;
	tab: string;
	name: string;
	desc?: string;
	link: string;
	icon?: string;
};

interface ModalField {
	key: string;
	label: string;
	desc?: string;
	[key: string]: unknown;
}

interface BaseConfig {
	id?: string;
	tab?: string;
	submitUrl?: string;
	headerTitle?: string;
	headerIcon?: string;
	modal?: ModalField[];
}

interface ModuleItem {
	id: string;
	name: string;
	desc?: string;
	icon?: string;
	[key: string]: unknown;
}

interface ModuleConfig extends BaseConfig {
	modules?: ModuleItem[];
}

// Matches templateService.ts's own `Record<string, any>` require.context
// typing in this same plugin — @types/webpack-env (which would supply
// __WebpackModuleApi.RequireContext) isn't a dependency here.
function buildIndexFromContext(context: any): SearchItem[] {
	return context
		.keys()
		.map((key) => context(key).default as ModuleConfig)
		.flatMap((cfg) => {
			const baseTab = cfg.tab || cfg.submitUrl || 'modules';

			// Modules catalog — cfg.modules holds the real, searchable items.
			if (cfg.modules && Array.isArray(cfg.modules)) {
				return cfg.modules
					.filter((mod) => mod.id && mod.name)
					.map((mod) => ({
						id: mod.id,
						tab: baseTab,
						name: mod.name,
						desc: mod.desc,
						link: `#&tab=${baseTab}&module=${mod.id}`,
						icon: mod.icon || '',
					}));
			}

			// A Settings tab — vulopilot's tab config uses headerTitle/
			// headerIcon rather than multivendorx's name/icon (react-frontend.md
			// documents this per-plugin field naming isn't unified), so those
			// are what get mapped into the shared SearchItem shape below.
			if (cfg.id && (cfg.tab || cfg.submitUrl)) {
				const baseLink = `#&tab=${baseTab}&subtab=${cfg.id}`;

				const items: SearchItem[] = [
					{
						id: cfg.id,
						tab: baseTab,
						name: cfg.headerTitle || '',
						link: baseLink,
						icon: cfg.headerIcon,
					},
				];

				if (cfg.modal && Array.isArray(cfg.modal)) {
					cfg.modal.forEach((field) => {
						if (!field.key || !field.label) {
							return;
						}

						items.push({
							id: `${cfg.id}_${field.key}`,
							tab: baseTab,
							name: field.label,
							desc: field.desc,
							link: `${baseLink}&field=${field.key}`,
							icon: cfg.headerIcon,
						});
					});
				}

				return items;
			}

			return [];
		});
}

export const searchIndex: SearchItem[] = [
	...buildIndexFromContext(contextSettings),
	...buildIndexFromContext(contextModules),
];
