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
	Banner,
	useModules,
	SettingsNavigator,
	RenderComponent,
} from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { useLocation, Link } from 'react-router-dom';

// Types
type SettingItem = Record<string, any>;

interface SettingsProps {
	id: string;
}
const faqs = [
	{
		question: __(
			'Why am I not receiving any emails when a customer subscribes for an out-of-stock product?',
			'multivendorx'
		),
		answer: __(
			'Please install a plugin like Email Log and perform a test subscription.',
			'multivendorx'
		),
		open: true,
	},
	{
		question: __('Why is the out-of-stock form not appearing?', 'multivendorx'),
		answer: __(
			'There might be a theme conflict issue. To troubleshoot, switch to a default theme like Twenty Twenty-Four and check if the form appears.',
			'multivendorx'
		),
		open: false,
	},
	{
		question: __('Does Notifima support product variations?', 'multivendorx'),
		answer: __(
			'Yes, product variations are fully supported and editable from the Inventory Manager. Notifima handles variable products with ease and uses an expandable feature to make managing variations clear and straightforward.',
			'multivendorx'
		),
		open: false,
	},
	{
		question: __(
			'Do you support Google reCaptcha for the out-of-stock form?',
			'multivendorx'
		),
		answer: __(
			'Yes, <a href="https://notifima.com/pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima" target="_blank">Notifima Pro</a> has support for reCaptcha.',
			'multivendorx'
		),
		open: false,
	},
];

const StatusAndTools: React.FC<SettingsProps> = () => {
	const settingsArray: SettingItem[] = getAvailableSettings(
		getTemplateData('tools'),
		[]
	);
	const location = new URLSearchParams(useLocation().hash.substring(1));

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
				appLocalizer.settings_databases_value['store-permissions'];

			if (storeCapability) {
				setStoreTabSetting(storeCapability);
				const userCapability =
					appLocalizer.settings_databases_value['user-permissions'] ||
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

				appLocalizer.settings_databases_value['user-permissions'] = {
					...userCapability,
					...result,
				};
			}
		}, [setting, settingName, currentTab]);

		// Special component
		if (currentTab === 'faq') {
			return (
				<Support
					title="Thank you for using Notifima"
					subTitle="We want to help you enjoy a wonderful experience with all of our products."
					url="https://www.youtube.com/embed/cgfeZH5z2dM?si=3zjG13RDOSiX2m1b"
					faqData={faqs}
				/>
			);
		}

		return (
			<>
				{settingName === currentTab ? (
					<RenderComponent
						settings={settingModal}
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
			<SettingsNavigator
				settingContent={settingsArray as any}
				currentSetting={location.get('subtab') as string}
				getForm={GetForm}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=status-tools&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				settingName={'Status & Tools'}
			/>
		</SettingProvider>
	);
};

export default StatusAndTools;
