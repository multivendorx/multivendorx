import { useEffect, useState } from 'react';
// Context
import { SettingProvider, useSetting } from '../contexts/SettingContext';
// Services
import { getTemplateData } from '../services/templateService';
// Utils
import {
	getAvailableSettings,
	getSettingById,
	RenderComponent,
	useModules,
	SettingsNavigator,
} from 'zyra';
import ShowProPopup from '../components/Popup/Popup';
import ShippingDelivery from './settings/ShippingDelivery';

type SettingItem = Record<string, any>;

interface SettingsProps {
	id: string;
}

const settings: React.FC<SettingsProps> = () => {
	const settingsArray: SettingItem[] = getAvailableSettings(
		getTemplateData('dashboardSettings'),
		[]
	);

	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const { modules } = useModules();
	const settings = appLocalizer.settings_all_meta || {};

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	const SimpleLink = ({ to, children, onClick, className }: any) => (
		<a href={to} onClick={onClick} className={className}>
			{children}
		</a>
	);

	const getCurrentTabFromUrl = () => {
		const hash = window.location.hash.replace(/^#/, '');
		const hashParams = new URLSearchParams(hash);
		return hashParams.get('subtab') || 'general';
	};

	const [currentTab, setCurrentTab] = useState(getCurrentTabFromUrl());

	useEffect(() => {
		const handleHashChange = () => setCurrentTab(getCurrentTabFromUrl());
		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, []);

	// Build hash URL for a given tab
	const prepareUrl = (tabId: string) => `#subtab=${tabId}`;
	const GetForm = (currentTab: string | null): JSX.Element | null => {
		console.log('tab', currentTab);
		// get the setting context
		const { setting, settingName, setSetting, updateSetting } =
			useSetting();
		const { modules } = useModules();

		if (!currentTab) {
			return null;
		}
		
		const settingModal = getSettingById(settingsArray as any, currentTab);

		// Ensure settings context is initialized
		if (settingName !== currentTab) {
			setSetting(currentTab, appLocalizer.settings_all_meta || {});
		}

		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if (settingName === currentTab) {
				appLocalizer.settings_all_meta = setting;
			}
		}, [setting, settingName, currentTab]);

		if (currentTab === 'shipping') {
			return <ShippingDelivery />;
		}

		return (
			<>
				{settingName === currentTab ? (
					<RenderComponent
						settings={settingModal as SettingContent}
						proSetting={appLocalizer.pro_settings_list}
						setting={setting}
						updateSetting={updateSetting}
						appLocalizer={appLocalizer}
						modules={modules}
						Popup={ShowProPopup}
					/>
				) : (
					<>Loading...</>
				)}
			</>
		);
	};

	return (
		<>
			<SettingProvider>
				<SettingsNavigator
					settingContent={settingsArray as any}
					currentSetting={currentTab}
					getForm={GetForm}
					prepareUrl={prepareUrl}
					appLocalizer={appLocalizer}
					variant="settings"
					Link={SimpleLink}
					menuIcon={true}
				/>
			</SettingProvider>
		</>
	);
};

export default settings;
