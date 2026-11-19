import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { CardComponent, NoticeManager, PopupComponent } from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import axios from 'axios';
import catalogx from '../../assets/images/catalogx.png';
import notifima from '../../assets/images/notifima.png';
import ShowProPopup from '../Popup/Popup';
import Insights from './Insights';
import { ACCOUNT_URL, CONTACT_URL, DOCS_URL, UTM } from '../../services/links';
/** The Pro features the dashboard's Pro panel lists (free sites only). */
const PRO_FEATURES = [
    {
        icon: 'single-sign-on',
        title: __('Single Sign-On', 'moowoodle'),
        desc: __('Students open Moodle™ courses straight from WordPress, without a second login.', 'moowoodle'),
    },
    {
        icon: 'cohort',
        title: __('Cohort enrollment', 'moowoodle'),
        desc: __('Sell a Moodle™ cohort as one product and enroll the whole group at once.', 'moowoodle'),
    },
    {
        icon: 'classroom-enrollment',
        title: __('Classroom seats', 'moowoodle'),
        desc: __('Teams and schools buy several seats and assign them to their learners.', 'moowoodle'),
    },
    {
        icon: 'gift-a-course',
        title: __('Gift a course', 'moowoodle'),
        desc: __('Customers buy a course for someone else, right at checkout.', 'moowoodle'),
    },
    {
        icon: 'subscription-courses',
        title: __('Subscription courses', 'moowoodle'),
        desc: __('Sell access on a recurring plan instead of a one-off price.', 'moowoodle'),
    },
    {
        icon: 'bulk-course-sync',
        title: __('Automatic sync', 'moowoodle'),
        desc: __('Courses, cohorts and users stay in step with Moodle™ on a schedule.', 'moowoodle'),
    },
];
/** Learning MooWoodle on your own: the docs, the videos and the community forum. */
const LEARN = [
    {
        icon: 'knowledgebase',
        title: __('Documentation', 'moowoodle'),
        desc: __('Guides for connecting Moodle™, syncing courses and selling them.', 'moowoodle'),
        link: DOCS_URL,
    },
    {
        icon: 'youtube',
        title: __('Video tutorials', 'moowoodle'),
        desc: __('Watch the setup, from the Moodle™ token to the first enrollment.', 'moowoodle'),
        link: 'https://www.youtube.com/@moowoodle/videos',
    },
    {
        icon: 'forum',
        title: __('Community forum', 'moowoodle'),
        desc: __('Ask on WordPress.org and get answers from our team and other users.', 'moowoodle'),
        link: 'https://wordpress.org/support/plugin/moowoodle/',
    },
];
/** Most problems are a broken connection or a failed sync: the two screens that show which. */
const TROUBLESHOOT = [
    {
        icon: 'centralized-connections',
        title: __('Test the Moodle™ connection', 'moowoodle'),
        desc: __('Checks the site URL, the token and each web service function MooWoodle needs.', 'moowoodle'),
        link: '#&tab=settings&subtab=connection-access',
    },
    {
        icon: 'report',
        title: __('Check the logs', 'moowoodle'),
        desc: __('Every request to Moodle™ and its error. Attach them when you contact support.', 'moowoodle'),
        link: '#&tab=settings&subtab=logs',
    },
];
/** Ways to reach the team. Manage plan only applies once there is a plan. */
const CONTACT = [
    {
        icon: 'customer-support',
        title: __('Contact support', 'moowoodle'),
        desc: __('Send our team a ticket and get a reply by email.', 'moowoodle'),
        link: CONTACT_URL,
    },
    {
        icon: 'coding',
        title: __('Custom development', 'moowoodle'),
        desc: __('We build tailored features for eLearning sites.', 'moowoodle'),
        link: `https://dualcube.com/custom-development/?${UTM}`,
    },
    ...(appLocalizer.khali_dabba
        ? [
            {
                icon: 'person',
                title: __('Manage plan', 'moowoodle'),
                desc: __('Download MooWoodle Pro, manage license keys and renew.', 'moowoodle'),
                link: ACCOUNT_URL,
            },
        ]
        : []),
];
/** The team's other WooCommerce plugins: the wordpress.org slug decides installed/active, the Pro link replaces Install once active. */
const COMPANION_PLUGINS = [
    {
        slug: 'woocommerce-catalog-enquiry',
        name: 'CatalogX',
        desc: __('Turn your store into a catalog with enquiry-based sales.', 'moowoodle'),
        logo: catalogx,
        proUrl: `https://catalogx.com/pricing/?${UTM}`,
    },
    {
        slug: 'woocommerce-product-stock-alert',
        name: 'Notifima',
        desc: __('Back-in-stock alerts and wishlists for WooCommerce.', 'moowoodle'),
        logo: notifima,
        proUrl: `https://notifima.com/pricing/?${UTM}`,
    },
];
const isExternal = (link) => !link.startsWith('#');
/** One help row: icon, title and description, the whole row a link (external ones open in a new tab). */
const LinkRow = ({ item }) => (_jsx("li", { children: _jsxs("a", { className: "mw-dash-row", href: item.link, ...(isExternal(item.link)
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {}), children: [_jsx("span", { className: "mw-dash-icon", "aria-hidden": "true", children: _jsx("i", { className: `adminfont-${item.icon}` }) }), _jsxs("span", { className: "mw-dash-row-text", children: [_jsx("strong", { children: item.title }), _jsx("span", { children: item.desc })] }), _jsx("i", { className: `mw-dash-row-arrow adminfont-${isExternal(item.link) ? 'external' : 'arrow-right'}`, "aria-hidden": "true" }), isExternal(item.link) && (_jsx("span", { className: "screen-reader-text", children: __('(opens in a new tab)', 'moowoodle') }))] }) }));
/**
 * The Overview tab: builds the Learn, Help & Support, companion-plugin and (free sites) Pro cards, and hands them to
 * Insights.tsx, which places them around the setup card or the figures.
 */
const DashboardTab = () => {
    const [installing, setInstalling] = useState('');
    const [pluginStatus, setPluginStatus] = useState({});
    const [plugins, setPlugins] = useState([]);
    const [proPopupOpen, setProPopupOpen] = useState(false);
    const isPro = !!appLocalizer.khali_dabba;
    useEffect(() => {
        axios
            .get(`${appLocalizer.apiUrl}/wp/v2/plugins`, {
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
            const pluginList = response.data;
            const statusMap = {};
            COMPANION_PLUGINS.forEach(({ slug }) => {
                statusMap[slug] = pluginList.some((plugin) => !!plugin.plugin?.includes(slug) &&
                    'active' === plugin.status);
            });
            setPlugins(pluginList);
            setPluginStatus(statusMap);
        })
            .catch((error) => {
            console.error('Failed to fetch plugins:', error);
        });
    }, []);
    const installOrActivatePlugin = (slug) => {
        if (!slug || installing) {
            return;
        }
        if (plugins.some((plugin) => plugin.plugin?.includes(slug))) {
            NoticeManager.add({
                title: __('Redirecting...', 'moowoodle'),
                message: __('Plugin already installed. Redirecting to activate...', 'moowoodle'),
                type: 'info',
                position: 'float',
            });
            window.open(`${appLocalizer.admin_url}plugins.php?s=${slug}`, '_blank');
            return;
        }
        setInstalling(slug);
        axios
            .post(`${appLocalizer.apiUrl}/wp/v2/plugins`, { slug, status: 'active' }, { headers: { 'X-WP-Nonce': appLocalizer.nonce } })
            .then(() => {
            window.location.reload();
        })
            .catch(() => {
            NoticeManager.add({
                title: __('Error!', 'moowoodle'),
                message: sprintf(
                /* translators: %s: Plugin slug or plugin name. */
                __('Could not install "%s".', 'moowoodle'), slug),
                type: 'error',
                position: 'float',
            });
        })
            .finally(() => setInstalling(''));
    };
    const proCard = isPro ? null : (_jsxs(CardComponent, { title: __('Do more with MooWoodle Pro', 'moowoodle'), desc: __('Group and classroom sales, single sign-on, gifting and subscriptions, in the admin you already use.', 'moowoodle'), className: "mw-dash-pro", action: _jsxs("span", { className: "mw-dash-pro-cta", children: [_jsx("span", { children: __('15-day money-back guarantee', 'moowoodle') }), _jsxs("button", { type: "button", className: "admin-btn btn-purple-bg", onClick: () => setProPopupOpen(true), children: [_jsx("i", { className: "adminfont-pro-tag", "aria-hidden": "true" }), __('Upgrade to Pro', 'moowoodle')] })] }), children: [_jsx("ul", { className: "mw-dash-pro-features", children: PRO_FEATURES.map((feature) => (_jsxs("li", { children: [_jsx("span", { className: "mw-dash-icon", "aria-hidden": "true", children: _jsx("i", { className: `adminfont-${feature.icon}` }) }), _jsxs("span", { children: [_jsx("strong", { children: feature.title }), _jsx("span", { children: feature.desc })] })] }, feature.title))) }), proPopupOpen && (_jsx(PopupComponent, { position: "lightbox", open: true, onClose: () => setProPopupOpen(false), width: 46, height: "auto", children: _jsx(ShowProPopup, {}) }))] }));
    const learnCard = (_jsx(CardComponent, { title: __('Learn MooWoodle', 'moowoodle'), desc: __('Guides, videos and the community', 'moowoodle'), children: _jsx("ul", { className: "mw-dash-list", children: LEARN.map((item) => (_jsx(LinkRow, { item: item }, item.title))) }) }));
    // Old Help & Support links (`#&tab=dashboard&view=help-support`) scroll to this card.
    const helpCard = (_jsx(CardComponent, { id: "moowoodle-help-support", title: __('Help & Support', 'moowoodle'), desc: __('Most problems are a broken connection or a failed sync. Still stuck? We are a message away.', 'moowoodle'), children: _jsxs("div", { className: "mw-dash-help-groups", children: [_jsxs("section", { children: [_jsx("h3", { children: __('Troubleshoot first', 'moowoodle') }), _jsx("ul", { className: "mw-dash-list", children: TROUBLESHOOT.map((item) => (_jsx(LinkRow, { item: item }, item.title))) })] }), _jsxs("section", { children: [_jsx("h3", { children: __('Talk to our team', 'moowoodle') }), _jsx("ul", { className: "mw-dash-list", children: CONTACT.map((item) => (_jsx(LinkRow, { item: item }, item.title))) })] })] }) }));
    const teamCard = (_jsx(CardComponent, { title: __('More from the MooWoodle team', 'moowoodle'), desc: __('Free plugins for your WooCommerce store', 'moowoodle'), children: _jsx("ul", { className: "mw-dash-list", children: COMPANION_PLUGINS.map((companion) => {
                const isActive = !!pluginStatus[companion.slug];
                const isBusy = installing === companion.slug;
                return (_jsxs("li", { className: "mw-dash-row", children: [_jsx("img", { className: "mw-dash-logo", src: companion.logo, alt: "" }), _jsxs("span", { className: "mw-dash-row-text", children: [_jsxs("strong", { children: [companion.name, _jsx("span", { className: `mw-dash-tag ${isActive ? 'is-active' : 'is-free'}`, children: isActive
                                                ? __('Active', 'moowoodle')
                                                : __('Free', 'moowoodle') })] }), _jsx("span", { children: companion.desc })] }), isActive ? (_jsxs("a", { className: "mw-dash-action", href: companion.proUrl, target: "_blank", rel: "noopener noreferrer", children: [sprintf(
                                /* translators: %s: plugin name. */
                                __('Get %s Pro', 'moowoodle'), companion.name), _jsx("span", { className: "screen-reader-text", children: __('(opens in a new tab)', 'moowoodle') })] })) : (_jsx("button", { type: "button", className: "mw-dash-action", disabled: !!installing, onClick: () => installOrActivatePlugin(companion.slug), children: isBusy
                                ? __('Installing…', 'moowoodle')
                                : __('Install', 'moowoodle') }))] }, companion.slug));
            }) }) }));
    // Insights decides where these sit: beside the setup card on a new site, under the figures once there are some.
    return (_jsx(Insights, { pro: proCard, learn: learnCard, help: helpCard, team: teamCard }));
};
export default DashboardTab;
//# sourceMappingURL=DashboardTab.js.map