/* global appLocalizer */
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, getApiResponse, sendApiResponse } from '@zyra/core';
import { NoticeManager } from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';
import { useSetting } from '../../../contexts/SettingContext';

interface RegenerateResponse {
	content: string;
}

/**
 * The actual llms.txt content is the `llms_txt_content` textarea field in
 * ../Scanning/Geo.ts — a plain, auto-saving settings field like every
 * other one on this tab (Controllers\Settings::update_item() writes it
 * straight to a real `/llms.txt` on save, see
 * GeoAnalysis\LlmsTxtGenerator::write_file()). This component renders
 * right below that field: the live link, and a "Regenerate" button that
 * discards whatever's in the textarea and replaces it with a fresh
 * GeoAnalysis\LlmsTxtGenerator::generate() pass over the site's current
 * pages/posts.
 *
 * `useSetting()` works here even though this isn't InputRenderer itself —
 * it's rendered from Settings.tsx's GetForm, which is inside the same
 * `SettingProvider` the whole settings tree already shares (see
 * Settings.tsx's own return statement).
 */
const LlmsTxtCard = () => {
	const { updateSetting } = useSetting();
	const [isRegenerating, setIsRegenerating] = useState(false);

	const handleRegenerate = () => {
		setIsRegenerating(true);

		getApiResponse<RegenerateResponse>(
			getApiLink(appLocalizer, 'llms-txt/regenerate'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		)
			.then((response) => {
				if (!response) {
					NoticeManager.add({
						uniqueKey: 'vulopilot-llms-txt-regenerate-failed',
						type: 'error',
						position: 'float',
						message: __(
							'Could not regenerate llms.txt. Please try again.',
							'vulopilot'
						),
					});
					return;
				}

				// Keeps the on-screen textarea and the saved setting in
				// sync immediately, rather than waiting on InputRenderer's
				// own debounce to notice the context changed — same
				// explicit-save posture the old toggle-only card used.
				updateSetting('llms_txt_content', response.content);

				sendApiResponse(
					appLocalizer,
					getApiLink(appLocalizer, 'settings'),
					{ setting: { llms_txt_content: response.content } }
				).then((saveResponse) => {
					NoticeManager.add({
						uniqueKey: 'vulopilot-llms-txt-regenerated',
						type: saveResponse ? 'success' : 'error',
						position: 'float',
						message: saveResponse
							? __(
									'llms.txt regenerated and saved.',
									'vulopilot'
								)
							: __(
									'Regenerated, but saving failed. Please try again.',
									'vulopilot'
								),
					});
				});
			})
			.finally(() => setIsRegenerating(false));
	};

	return (
		<>
			<p className="llms-txt-live-link">
				{__('Live file:', 'vulopilot')}{' '}
				<a
					href={`${appLocalizer.site_url}/llms.txt`}
					target="_blank"
					rel="noopener noreferrer"
				>
					{`${appLocalizer.site_url}/llms.txt`}
				</a>
			</p>
			<ButtonInput
				buttons={{
					text: isRegenerating
						? __('Regenerating…', 'vulopilot')
						: __('Regenerate', 'vulopilot'),
					icon: 'update',
					onClick: handleRegenerate,
					disabled: isRegenerating,
				}}
			/>
		</>
	);
};

export default LlmsTxtCard;
