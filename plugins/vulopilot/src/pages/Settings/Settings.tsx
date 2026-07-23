/* global appLocalizer */
import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, getApiResponse, sendApiResponse } from '@zyra/core';
import {
	CardComponent,
	FormGroupComponent,
	ModuleGuardComponent,
	NoticeManager,
} from '@zyra/components';
import { ButtonInput, SelectInput, TextInput } from '@zyra/inputs';

interface VuloPilotSettings {
	scan_frequency: string;
	notification_email: string;
}

const DEFAULT_SETTINGS: VuloPilotSettings = {
	scan_frequency: 'daily',
	notification_email: '',
};

/**
 * A hand-built settings form rather than the declarative settings-config
 * pattern (business-hours.ts-style) react-frontend.md describes elsewhere
 * — that renderer lives in the free multivendorx plugin's own dashboard
 * code and is a bigger piece to adopt than this pass's scope covers. This
 * is a real, working form against a real REST endpoint contract in the
 * meantime; switching it to the schema-driven renderer is a reasonable
 * follow-up, not something to silently skip acknowledging.
 */
const Settings = () => {
	const [settings, setSettings] = useState<VuloPilotSettings>(DEFAULT_SETTINGS);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadSettings = () => {
		setIsLoading(true);
		setError(null);

		getApiResponse<VuloPilotSettings>(
			getApiLink(appLocalizer, 'settings'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		)
			.then((response) => {
				if (!response) {
					setError(
						__('Could not load settings.', 'vulopilot')
					);
					return;
				}

				setSettings({ ...DEFAULT_SETTINGS, ...response });
			})
			.finally(() => setIsLoading(false));
	};

	useEffect(loadSettings, []);

	const handleSave = () => {
		setIsSaving(true);

		sendApiResponse(
			appLocalizer,
			getApiLink(appLocalizer, 'settings'),
			settings
		)
			.then((response) => {
				if (response) {
					NoticeManager.add({
						uniqueKey: 'vulopilot-settings-saved',
						type: 'success',
						position: 'notice',
						message: __('Settings saved.', 'vulopilot'),
					});
				} else {
					NoticeManager.add({
						uniqueKey: 'vulopilot-settings-save-failed',
						type: 'error',
						position: 'notice',
						message: __(
							'Could not save settings. Please try again.',
							'vulopilot'
						),
					});
				}
			})
			.finally(() => setIsSaving(false));
	};

	if (error) {
		return (
			<ModuleGuardComponent
				icon="warning"
				title={__('Could not load settings', 'vulopilot')}
				desc={error}
				buttonText={__('Retry', 'vulopilot')}
				onButtonClick={loadSettings}
			/>
		);
	}

	return (
		<CardComponent
			title={__('Settings', 'vulopilot')}
			isLoading={isLoading}
			action={
				<ButtonInput
					buttons={{
						text: isSaving
							? __('Saving…', 'vulopilot')
							: __('Save changes', 'vulopilot'),
						icon: 'saved',
						onClick: handleSave,
						disabled: isSaving,
					}}
				/>
			}
		>
			<FormGroupComponent
				label={__('Scan frequency', 'vulopilot')}
				desc={__(
					'How often VuloPilot runs its scheduled scans.',
					'vulopilot'
				)}
			>
				<SelectInput
					type="single-select"
					value={settings.scan_frequency}
					options={[
						{ label: __('Hourly', 'vulopilot'), value: 'hourly' },
						{ label: __('Daily', 'vulopilot'), value: 'daily' },
						{ label: __('Weekly', 'vulopilot'), value: 'weekly' },
					]}
					onChange={(value: string | string[]) =>
						setSettings((prev) => ({
							...prev,
							scan_frequency: value as string,
						}))
					}
				/>
			</FormGroupComponent>

			<FormGroupComponent
				label={__('Notification email', 'vulopilot')}
				desc={__(
					'Where critical findings and automation failures are sent.',
					'vulopilot'
				)}
			>
				<TextInput
					type="email"
					value={settings.notification_email}
					onChange={(value: string | number | FileList) =>
						setSettings((prev) => ({
							...prev,
							notification_email: value as string,
						}))
					}
				/>
			</FormGroupComponent>
		</CardComponent>
	);
};

export default Settings;
