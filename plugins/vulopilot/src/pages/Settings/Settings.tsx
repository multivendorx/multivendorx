/* global appLocalizer */
import React, { useEffect, useRef, useState, JSX } from 'react';
import { __ } from '@wordpress/i18n';
import { useLocation, Link } from 'react-router-dom';
import { getApiLink, getApiResponse } from '@zyra/core';
import { getAvailableSettings, getSettingById } from '@zyra/core';
import { InputRenderer } from '@zyra/inputs';
import { CardComponent, ModuleGuardComponent, NavigatorComponent } from '@zyra/components';
import { SettingProvider, useSetting } from '../../contexts/SettingContext';
import getTemplateData from '../../services/templateService';
import ImportExportPanel from '../../components/Settings/ImportExportPanel';

/**
 * Built on zyra's real settings framework (`InputRenderer`/
 * `NavigatorComponent`, `getAvailableSettings`/`getSettingById` from
 * @zyra/core) — the same one the free multivendorx plugin's own
 * components/Settings/Settings.tsx uses, replacing this page's previous
 * hand-built form. Tab configs live under ../../components/Settings/*.ts
 * as plain declarative objects (react-frontend.md's business-hours.ts
 * pattern), auto-discovered by templateService.ts's `require.context`.
 *
 * VuloPilot's settings are one flat wp_options row, not per-tab
 * namespaced data — unlike multivendorx's `appLocalizer.admin_settings`,
 * so this page fetches the full flat object once and, per tab, seeds
 * `SettingContext` with just that tab's own field keys (looked up from
 * the tab's own `modal[].key` list) and merges live edits back into a
 * ref so switching tabs and back doesn't lose unsaved-but-in-flight
 * edits. Each field then auto-saves itself via InputRenderer's own
 * built-in debounce, POSTing `{ setting, settingName }` — Controllers\Settings's
 * `update_item()` merges that subset into the stored option rather than
 * replacing it wholesale.
 *
 * The 'import-export' tab is a "special component" escape hatch (same
 * one multivendorx's Settings.tsx uses for StoreStatus/Invoice/etc.) —
 * file download/upload and a destructive reset don't fit the per-field
 * auto-save model, so that one tab id renders ImportExportPanel instead
 * of InputRenderer.
 */
const Settings = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const settingsRef = useRef<Record<string, unknown>>({});

	const settingsArray = getAvailableSettings(getTemplateData('settings'), []);
	const location = new URLSearchParams(useLocation().hash.substring(1));

	const loadSettings = () => {
		setIsLoading(true);
		setError(null);

		getApiResponse<Record<string, unknown>>(
			getApiLink(appLocalizer, 'settings'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		)
			.then((response) => {
				if (!response) {
					setError(__('Could not load settings.', 'vulopilot'));
					return;
				}

				settingsRef.current = response;
			})
			.finally(() => setIsLoading(false));
	};

	useEffect(loadSettings, []);

	const GetForm = (currentTab: string | null): JSX.Element | null => {
		// Every hook this function uses must run on every call regardless
		// of $currentTab — an early `return null` before useEffect() (the
		// original shape this was ported from also has this same latent
		// issue) makes the number of hooks React sees differ between the
		// render where NavigatorComponent hasn't picked a subtab yet
		// (currentTab === null) and the one right after it does, which is
		// exactly React error #310 ("rendered fewer hooks than expected").
		const { setting, settingName, setSetting, updateSetting } = useSetting();

		const settingModal = currentTab ? getSettingById(settingsArray, currentTab) : null;
		const fieldKeys: string[] = (settingModal?.modal ?? []).map(
			(field: { key: string }) => field.key
		);

		if (currentTab && settingName !== currentTab) {
			const tabFields: Record<string, unknown> = {};
			fieldKeys.forEach((key) => {
				tabFields[key] = settingsRef.current[key];
			});
			setSetting(currentTab, tabFields);
		}

		useEffect(() => {
			if (currentTab && settingName === currentTab) {
				settingsRef.current = { ...settingsRef.current, ...setting };
			}
		}, [setting, settingName, currentTab]);

		if (!currentTab) {
			return null;
		}

		if (currentTab === 'import-export') {
			return <ImportExportPanel />;
		}

		return (
			<>
				{settingName === currentTab ? (
					<InputRenderer
						settings={settingModal}
						setting={setting}
						updateSetting={updateSetting}
						Popup={() => null}
					/>
				) : (
					<>{__('Loading…', 'vulopilot')}</>
				)}
			</>
		);
	};

	if (error) {
		return (
			<CardComponent title={__('Settings', 'vulopilot')}>
				<ModuleGuardComponent
					icon="warning"
					title={__('Could not load settings', 'vulopilot')}
					desc={error}
					buttonText={__('Retry', 'vulopilot')}
					onButtonClick={loadSettings}
				/>
			</CardComponent>
		);
	}

	if (isLoading) {
		return <CardComponent title={__('Settings', 'vulopilot')} isLoading />;
	}

	return (
		<SettingProvider>
			<NavigatorComponent
				settingContent={settingsArray}
				currentSetting={location.get('subtab') as string}
				getForm={GetForm}
				prepareUrl={(subTab: string) =>
					`?page=vulopilot#&tab=settings&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				settingName={'Settings'}
				className="admin-settings"
			/>
		</SettingProvider>
	);
};

export default Settings;
