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

function buildIndexFromContext(context: __WebpackModuleApi.RequireContext) {
    return context
        .keys()
        .map((key) => context(key).default)
        .flatMap((cfg) => {
            const baseTab = cfg.tab || cfg.submitUrl || 'modules';

            // For Modules, cfg.modules contains actual items
            if (cfg.modules && Array.isArray(cfg.modules)) {
                return cfg.modules
                    .filter((mod: any) => mod.id && mod.name)
                    .map((mod: any) => ({
                        id: mod.id,
                        tab: baseTab,
                        name: mod.name,
                        desc: mod.desc,
                        link: `#&tab=${baseTab}`,
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
                        name: cfg.name,
                        desc: cfg.desc,
                        link: baseLink,
                    },
                ];

                if (cfg.modal) {
                    cfg.modal.forEach((field: any) => {
                        items.push({
                            id: `${cfg.id}_${field.key}`,
                            tab: baseTab,
                            name: field.label,
                            link: `${baseLink}&field=${field.key}`,
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
