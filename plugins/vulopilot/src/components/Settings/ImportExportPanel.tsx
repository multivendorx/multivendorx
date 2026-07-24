/* global appLocalizer */
import React, { useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, sendApiResponse } from '@zyra/core';
import { CardComponent, NoticeManager } from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';

/**
 * Hand-built rather than InputRenderer-driven — see ImportExport.ts's own
 * docblock for why file download/upload and a destructive reset don't fit
 * the per-field auto-save model every other Settings tab uses.
 */
const ImportExportPanel = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isBusy, setIsBusy] = useState(false);

	const handleExport = () => {
		// getApiLink() already contains its own `?` on plain-permalink sites
		// (rest_route=/…) — see useApiList.ts's identical fix for why `&`
		// is required here instead of a second `?` once that's the case.
		const baseUrl = getApiLink(appLocalizer, 'settings/export');
		const separator = baseUrl.includes('?') ? '&' : '?';
		window.open(`${baseUrl}${separator}_wpnonce=${appLocalizer.nonce}`, '_blank');
	};

	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = '';

		if (!file) {
			return;
		}

		setIsBusy(true);

		const reader = new FileReader();

		reader.onload = () => {
			let parsed: Record<string, unknown> | null = null;

			try {
				parsed = JSON.parse(String(reader.result));
			} catch {
				parsed = null;
			}

			if (!parsed || typeof parsed !== 'object') {
				NoticeManager.add({
					uniqueKey: 'vulopilot-settings-import-invalid',
					type: 'error',
					position: 'notice',
					message: __(
						'That file doesn\'t look like a valid VuloPilot settings export.',
						'vulopilot'
					),
				});
				setIsBusy(false);
				return;
			}

			sendApiResponse(
				appLocalizer,
				getApiLink(appLocalizer, 'settings/import'),
				{ settings: parsed }
			)
				.then((response) => {
					NoticeManager.add({
						uniqueKey: 'vulopilot-settings-import',
						type: response ? 'success' : 'error',
						position: 'notice',
						message: response
							? __('Settings imported. Reload the page to see them.', 'vulopilot')
							: __('Could not import settings. Please try again.', 'vulopilot'),
					});
				})
				.finally(() => setIsBusy(false));
		};

		reader.readAsText(file);
	};

	const handleReset = () => {
		 
		if (!window.confirm(__('Reset every VuloPilot setting to its default value? This can\'t be undone.', 'vulopilot'))) {
			return;
		}

		setIsBusy(true);

		sendApiResponse(appLocalizer, getApiLink(appLocalizer, 'settings/reset'), {})
			.then((response) => {
				NoticeManager.add({
					uniqueKey: 'vulopilot-settings-reset',
					type: response ? 'success' : 'error',
					position: 'notice',
					message: response
						? __('Settings reset to defaults. Reload the page to see them.', 'vulopilot')
						: __('Could not reset settings. Please try again.', 'vulopilot'),
				});
			})
			.finally(() => setIsBusy(false));
	};

	return (
		<CardComponent title={__('Import / Export', 'vulopilot')}>
			<p>
				{__(
					'Download every VuloPilot setting as a JSON file, restore settings from a previously exported file, or reset everything back to defaults.',
					'vulopilot'
				)}
			</p>

			<ButtonInput
				buttons={{
					text: __('Export settings', 'vulopilot'),
					icon: 'download',
					onClick: handleExport,
					disabled: isBusy,
				}}
			/>

			<ButtonInput
				buttons={{
					text: __('Import settings', 'vulopilot'),
					icon: 'upload',
					onClick: handleImportClick,
					disabled: isBusy,
				}}
			/>
			<input
				ref={fileInputRef}
				type="file"
				accept="application/json"
				style={{ display: 'none' }}
				onChange={handleFileSelected}
			/>

			<ButtonInput
				buttons={{
					text: __('Reset to defaults', 'vulopilot'),
					icon: 'image-rotate',
					onClick: handleReset,
					disabled: isBusy,
				}}
			/>
		</CardComponent>
	);
};

export default ImportExportPanel;
