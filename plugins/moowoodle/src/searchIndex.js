import { __ } from '@wordpress/i18n';
import { getTemplateData } from './services/templateService';
/** Returns a value if it is a string, otherwise an empty string. */
const text = (value) => 'string' === typeof value ? value : '';
/** Drops the HTML some descriptions carry (links, line breaks, highlights), so they read as plain text in results. */
const plain = (value) => text(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
/** Flattens nested settings folders into a single list of tabs. */
const flattenTabs = (nodes) => nodes.flatMap((node) => 'folder' === node.type
    ? flattenTabs(node.content)
    : [node.content]);
const PAGES = [
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
        desc: __('Documentation, videos, the forum, troubleshooting and contacting our team.', 'moowoodle'),
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
const indexNavigator = (type) => flattenTabs(getTemplateData(type)).flatMap((tab) => {
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
                        desc: plain(field.settingDescription) ||
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
export const buildSearchIndex = () => [
    ...PAGES.map((page) => ({
        id: `page-${page.id}`,
        category: 'pages',
        name: page.name,
        desc: page.desc,
        link: `&tab=${page.tab}`,
        icon: page.icon,
    })),
    ...indexNavigator('settings'),
    ...indexNavigator('synchronization'),
];
//# sourceMappingURL=searchIndex.js.map