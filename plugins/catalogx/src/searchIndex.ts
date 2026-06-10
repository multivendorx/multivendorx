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

interface BaseConfig {
	id?: string;
	tab?: string;
	submitUrl?: string;
	name?: string;
	desc?: string;
	icon?: string;
	modal?: ModalField[];
}

interface ModuleConfig extends BaseConfig {
	modules?: Module[];
}

interface Module {
	id: string;
	name: string;
	desc?: string;
	icon?: string;
	[key: string]: unknown;
}

interface ModalField {
	key: string;
	label: string;
	[key: string]: unknown;
}

interface SettingsConfig extends BaseConfig {
	id: string;
	tab?: string;
	submitUrl?: string;
	modal?: ModalField[];
}

function buildIndexFromContext(
	context: __WebpackModuleApi.RequireContext
): SearchItem[] {
	return context
		.keys()
		.map((key) => context(key).default as ModuleConfig | SettingsConfig)
		.flatMap((cfg) => {
			const baseTab = cfg.tab || cfg.submitUrl || 'modules';

			// For Modules, cfg.modules contains actual items
			if (cfg.modules && Array.isArray(cfg.modules)) {
				return (cfg as ModuleConfig).modules
					.filter((mod: Module) => mod.id && mod.name)
					.map((mod: Module) => ({
						id: mod.id,
						tab: baseTab,
						name: mod.name,
						desc: mod.desc,
						link: `#&tab=${baseTab}&module=${mod.id}`,
						icon: mod.icon || '',
					}));
			}

			// For Settings or other configs
			if (cfg.id && (cfg.tab || cfg.submitUrl)) {
				const baseLink =
					baseTab === 'modules'
						? `#&tab=${baseTab}`
						: `#&tab=${baseTab}&subtab=${cfg.id}`;

				const items: SearchItem[] = [
					{
						id: cfg.id,
						tab: baseTab,
						name: cfg.name || '',
						desc: cfg.desc,
						link: baseLink,
						icon: cfg.icon,
					},
				];

				if (cfg.modal && Array.isArray(cfg.modal)) {
					cfg.modal.forEach((field: ModalField) => {
						items.push({
							id: `${cfg.id}_${field.key}`,
							tab: baseTab,
							name: field.label,
							link: `${baseLink}&field=${field.key}`,
							icon: cfg.icon,
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
