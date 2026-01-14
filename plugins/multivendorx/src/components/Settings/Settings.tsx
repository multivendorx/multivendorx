// /* global appLocalizer */
import Brand from '../../assets/images/multivendorx-logo.png';
import React, { useEffect, JSX } from 'react';
import { __ } from '@wordpress/i18n';
// Context
import { SettingProvider, useSetting } from '../../contexts/SettingContext';
// Services
import { getTemplateData } from '../../services/templateService';
// Utils
import {
	getAvailableSettings,
	getSettingById,
	Support,
	AdminForm,
	Banner,
	Tabs,
	useModules,
} from 'zyra';
import ShowProPopup from '../Popup/popup';
import { useLocation, Link } from 'react-router-dom';
import Notifications from './Notification/Notification';
import StoreStatus from './StoreConfiguration/StoreStatus';

// Types
type SettingItem = Record<string, any>;

interface SettingsProps {
	id: string;
}

interface Products {
	title: string;
	description: string;
}

const supportLink = [
	{
		title: __('Get in touch with Support', 'notifima'),
		icon: 'adminfont-mail',
		description: __(
			'Reach out to the support team for assistance or guidance.',
			'notifima'
		),
		link: 'https://notifima.com/contact-us/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima',
	},
	{
		title: __('Explore Documentation', 'notifima'),
		icon: 'adminfont-submission-message',
		description: __('Understand the plugin and its settings.', 'notifima'),
		link: 'https://notifima.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima',
	},
	{
		title: __('Contribute Here', 'notifima'),
		icon: 'adminfont-support',
		description: __('Participate in product enhancement.', 'notifima'),
		link: 'https://github.com/multivendorx/multivendorx/issues/',
	},
];

const products: Products[] = [
	{
		title: __('Double Opt-In', 'notifima'),
		description: __(
			'Experience the power of Double Opt-In for our Stock Alert Form - Guaranteed precision in every notification!',
			'notifima'
		),
	},
	{
		title: __('Your Subscription Hub', 'notifima'),
		description: __(
			'Subscription Dashboard - Easily monitor and download lists of out-of-stock subscribers for seamless management.',
			'notifima'
		),
	},
	{
		title: __('Mailchimp Bridge', 'notifima'),
		description: __(
			'Seamlessly link WooCommerce out-of-stock subscriptions with Mailchimp for effective marketing.',
			'notifima'
		),
	},
	{
		title: __('Unsubscribe Notifications', 'notifima'),
		description: __(
			'User-Initiated Unsubscribe from In-Stock Notifications.',
			'notifima'
		),
	},
	{
		title: __('Ban Spam Emails', 'notifima'),
		description: __(
			'Email and Domain Blacklist for Spam Prevention.',
			'notifima'
		),
	},
];

const Settings: React.FC<SettingsProps> = () => {
	const settingsArray: SettingItem[] = getAvailableSettings(
		getTemplateData('settings'),
		[]
	);
	const location = new URLSearchParams(useLocation().hash.substring(1));

	const getBanner = () => {
		return (
			<Banner
				products={products}
				isPro={appLocalizer.khali_dabba}
				proUrl={appLocalizer.pro_url}
				tag="Why Premium"
				buttonText="View Pricing"
				bgCode="#852aff" // backgroud color
				textCode="#fff" // text code
				btnCode="#fff" // button color
				btnBgCode="#e35047" // button backgroud color
			/>
		);
	};
	// Render the dynamic form
	const GetForm = (currentTab: string | null): JSX.Element | null => {
		// get the setting context
		const { setting, settingName, setSetting, updateSetting } =
			useSetting();
		const { modules } = useModules();

		if (!currentTab) {
			return null;
		}
		const settingModal = getSettingById(settingsArray as any, currentTab);
		const [storeTabSetting, setStoreTabSetting] = React.useState<any>(null);

		// Ensure settings context is initialized
		if (settingName !== currentTab) {
			setSetting(
				currentTab,
				appLocalizer.settings_databases_value[currentTab] || {}
			);
		}

		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if (settingName === currentTab) {
				appLocalizer.settings_databases_value[settingName] = setting;
			}

			const storeCapability =
				appLocalizer.settings_databases_value['store-capability'];

			if (storeCapability) {
				setStoreTabSetting(storeCapability);
				const userCapability =
					appLocalizer.settings_databases_value['user-capability'] ||
					{};

				// all capability arrays into one
				const storeOwnerCaps: string[] = [];
				Object.values(storeCapability).forEach((caps) => {
					if (Array.isArray(caps)) {
						storeOwnerCaps.push(...caps);
					}
				});

				const result = { store_owner: storeOwnerCaps };

				Object.entries(userCapability).forEach(([role, caps]) => {
					if (role !== 'store_owner' && Array.isArray(caps)) {
						userCapability[role] = caps.filter((cap) =>
							storeOwnerCaps.includes(cap)
						);
					}
				});

				appLocalizer.settings_databases_value['user-capability'] = {
					...userCapability,
					...result,
				};
			}
		}, [setting, settingName, currentTab]);

		// Special component
		if (currentTab === 'notifications') {
			return <Notifications />;
		}
		if (currentTab === 'store-status-control') {
			return <StoreStatus />;
		}

		return (
			<>
				{settingName === currentTab ? (
					<AdminForm
						settings={settingModal as SettingContent}
						proSetting={appLocalizer.pro_settings_list}
						setting={setting}
						updateSetting={updateSetting}
						appLocalizer={appLocalizer}
						modules={modules}
						Popup={ShowProPopup}
						storeTabSetting={storeTabSetting}
					/>
				) : (
					<>Loading...</>
				)}
			</>
		);
	};

	return (
		<SettingProvider>
			<Tabs
				tabData={settingsArray as any}
				currentTab={location.get('subtab') as string}
				getForm={GetForm}
				BannerSection={getBanner}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=settings&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				brandImg={Brand}
				supprot={supportLink}
				Link={Link}
				settingName={'Settings'}
			/>
		</SettingProvider>
	);
};

export default Settings;
